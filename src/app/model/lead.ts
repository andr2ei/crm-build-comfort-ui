import { Status } from "./status"
import { Product } from "./product"

export interface Lead {
    id: number
    firstName: string
    lastName: string
    phone: string
    address: string
    email: string
    storage: string
    storageUnitAddress: string
    tradePrice: number
    discount: number
    status: Status | undefined
    creationDate: string
    completedDate: string
    comment: string
    prepay: number
    prepayType: string
    surcharge: number
    surchargeType: string
    products: Product[]
}