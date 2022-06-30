import { Status } from "./status"

export interface Lead {
    id: number,
    firstName: string,
    lastName: string,
    phone: string,
    address: string,
    email: string,
    storage: string,
    tradePrice: number,
    discount: number,
    status: Status | undefined,
    creationDate: string
}