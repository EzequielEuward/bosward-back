import { IsOptional, IsString } from 'class-validator';

export class UpdateCustomerDto {
    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    documentId?: string;

    @IsString()
    @IsOptional()
    addressLine?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    province?: string;

    @IsString()
    @IsOptional()
    postalCode?: string;

    @IsString()
    @IsOptional()
    country?: string;
}
