export interface TransactionModel {
    id: string
    itemName: string
    name: string
    nik: string
    phoneNumber: string
    orderDate: string
    returnDate: string
    status: 'READY' | 'CANCEL'| 'DONE' | 'PROCESSS'  | 'REQUEST'
    address: string
    pricePerMonth: string
    pricePerWeek: string
    guidId: string
    updatedAt: string
}