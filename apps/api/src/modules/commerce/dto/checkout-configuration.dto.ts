import { IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentMethodsDto {
  @IsBoolean()
  cash: boolean;

  @IsBoolean()
  qr: boolean;

  @IsBoolean()
  transfer: boolean;

  @IsBoolean()
  paymentLink: boolean;
}

export class ShippingMethodsDto {
  @IsBoolean()
  pickup: boolean;

  @IsBoolean()
  delivery: boolean;

  @IsBoolean()
  dinein: boolean;
}

export class CheckoutConfigurationDto {
  @IsObject()
  @ValidateNested()
  @Type(() => PaymentMethodsDto)
  payment_methods: PaymentMethodsDto;

  @IsObject()
  @ValidateNested()
  @Type(() => ShippingMethodsDto)
  shipping_methods: ShippingMethodsDto;
}
