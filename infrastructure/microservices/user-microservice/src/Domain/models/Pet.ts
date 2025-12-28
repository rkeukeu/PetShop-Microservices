import { PetType } from "../enums/PetType";

export class Pet {
  id!: number;
  latinName!: string;
  commonName!: string;
  type!: PetType;
  price!: number;
  isSold!: boolean;
}
