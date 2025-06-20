import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { parse } from 'json2csv';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const newProduct = this.productRepository.create(createProductDto)
    const saveProduct = await this.productRepository.save(newProduct)

    // ลบ cache เก่าของข้อมูลทั้งหมด
    const key = `product_all`;
    await this.cacheManager.del(key);
    
    return saveProduct;
  }

  async findAll() {
    // กำหนด key
    const key = `product_all`
    // ดึงข้อมูลที่เก็บอยู่ใน redis ตาม key 
    const cached = await this.cacheManager.get(key);
    // ถ้าข้อมูลถูกเก็บอยู่ใน redis อยู่แล้ว return ไปใช้ได้เลย
    if (cached) {
      console.log(`product redis cache success`);
      return cached
    }
    // ถ้าข้อมูลยังไม่ได้ถูกเก็บอยู่ใน redis
    const product = await this.productRepository.find();

    if (product.length == 0) throw new NotFoundException('product not found')

    // เก็บข้อมูลจาก database เข้าใน redis ตาม key
    await this.cacheManager.set(key, product);
    const value = await this.cacheManager.get(key);

    return value
  }

  async findOne(id: number) {
    // กำหนด key
    const key = `product_${id}`
    // ดึงข้อมูลที่เก็บอยู่ใน redis ตาม key 
    const cached = await this.cacheManager.get(key);
    // ถ้าข้อมูลถูกเก็บอยู่ใน redis อยู่แล้ว return ไปใช้ได้เลย
    if (cached) {
      console.log(`product ${id} redis cache success`);
      return cached
    }
    // ถ้าข้อมูลยังไม่ได้ถูกเก็บอยู่ใน redis
    const product = await this.productRepository.findOne({
      where: {
        id: id
      }
    });

    if (!product) {
      throw new NotFoundException(`product id ${id} not found`);
    }

    // เก็บข้อมูลจาก database เข้าใน redis ตาม key
    await this.cacheManager.set(key, product);
    const value = await this.cacheManager.get(key);

    return value
  }

  async exportCSV() {
    const products = await this.productRepository.find();

    if (products.length == 0) throw new NotFoundException('product not found')
    
    const fields = ['id', 'name', 'price', 'stock', 'detail', 'createdAt', 'updatedAt'];
    const opts = { fields };
    const csv = parse(products, opts);
    // ทำให้รองรับภาษาไทย
    const csvWithBOM = '\uFEFF' + csv;
    return csvWithBOM;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({
      where: {
        id: id
      }
    });

    if (!product) {
      throw new NotFoundException(`product id ${id} not found`);
    }

    // รวมข้อมูลเก่ากับข้อมูลใหม่
    const newProduct = Object.assign(product, updateProductDto);

    const updateProduct = await this.productRepository.save(newProduct);

    // ลบ cache เก่าของข้อมูลทั้งหมด
    const key = `product_all`;
    await this.cacheManager.del(key);

    // ลบ cache เก่าของข้อมูลตาม id
    const keyId = `product_${id}`;
    await this.cacheManager.del(keyId);

    return updateProduct;
  }

  async remove(id: number) {
    const product = await this.productRepository.findOne({
      where: {
        id: id
      }
    });

    if (!product) {
      throw new NotFoundException(`product id ${id} not found`);
    }

    const deleteProduct = await this.productRepository.delete(id)

    // ลบ cache เก่าของข้อมูลทั้งหมด
    const key = `product_all`;
    await this.cacheManager.del(key);

    // ลบ cache เก่าของข้อมูลตาม id
    const keyId = `product_${id}`;
    await this.cacheManager.del(keyId);

    return deleteProduct;
  }
}
