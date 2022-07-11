import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Status } from '../model/status';
import { Lead } from '../model/lead';
import { Product } from '../model/product';
import { Constants } from '../utils/constants';
import { MessageService } from '../service/message.service'
import { MessagesComponent } from '../messages/messages.component'

import {MatDialog} from '@angular/material/dialog';
import { IncomePerMonth } from '../model/income-per-month';


@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

  displayedLeadColumns: string[] = ['id', 'firstName', 'lastName', 'phone', 'address', 'email', 
                                'storage', 'tradePrice', 'costWithDiscount', 'cost', 'income',
                                'discount', 'creationDate', 'comment', 'status'];
  displayedProductColumns: string[] = ['name', 'price', 'count', 'comment', 'cost']
  displayedIncomeColumns: string[] = ['year', 'month', 'totalTradePrice', 'totalCost', 'totalIncome']

  payTypes: string[] = ['Наличные', 'Карта']

  private allStatusesURL = `http://${Constants.BASE_HOST}:8080/api/v1/status/all`

  private allLeadsIncomeURL = `http://${Constants.BASE_HOST}:8080/api/v1/lead/all/income`
  private allLeadsURL = `http://${Constants.BASE_HOST}:8080/api/v1/lead/all`
  private allLeadsByStatusIdURL = `http://${Constants.BASE_HOST}:8080/api/v1/lead/all/status/`
  private saveLeadURL = `http://${Constants.BASE_HOST}:8080/api/v1/lead/create`
  private editLeadURL = `http://${Constants.BASE_HOST}:8080/api/v1/lead/edit`

  private allProductsByLeadIdURL = `http://${Constants.BASE_HOST}:8080/api/v1/product/all/lead/`
  private editProductURL = `http://${Constants.BASE_HOST}:8080/api/v1/product/edit`
  private saveProductURL = `http://${Constants.BASE_HOST}:8080/api/v1/product/create`
  private deleteProductURL = `http://${Constants.BASE_HOST}:8080/api/v1/product/`
  private exportPdfProductURL = `http://${Constants.BASE_HOST}:8080/api/v1/product/export/pdf/`

  showStatisticsFlag: boolean = false;
  incomePerMonth: IncomePerMonth[] = []

  statuses: Status[] = []
  selectedLeads?: Lead[]
  clonedSelectedLeads: Lead[] = []
  selectedStatus?: Status

  saveLeadInProgress: boolean = false
  createLeadFlag: boolean = false
  statusOfLeadToCreate: Status = {
    id: 0,
    name: ''
  }
  leadToCreate: Lead = {
    id: 0,
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    email: '',
    storage: '',
    storageUnitAddress: '',
    tradePrice: 0,
    discount: 0,
    status: undefined,
    creationDate: '',
    comment: '',
    prepay: 0.0,
    prepayType: '',
    surcharge: 0.0,
    surchargeType: '',
    products: []
  };
  emptyLead: Lead = {
    id: 0,
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    email: '',
    storage: '',
    storageUnitAddress: '',
    tradePrice: 0,
    discount: 0,
    status: undefined,
    creationDate: '',
    comment: '',
    prepay: 0.0,
    prepayType: '',
    surcharge: 0.0,
    surchargeType: '',
    products: []
  };

  editLeadFlag: boolean = false
  statusOfLeadToUpdate: Status = {
    id: 0,
    name: ''
  }
  leadToEdit: Lead = {
    id: 0,
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    email: '',
    storage: '',
    storageUnitAddress: '',
    tradePrice: 0,
    discount: 0,
    status: undefined,
    creationDate: '',
    comment: '',
    prepay: 0.0,
    prepayType: '',
    surcharge: 0.0,
    surchargeType: '',
    products: []
  };

  editProductFlag: boolean = false;
  productsOfLeadToUpdate: Product[] = []
  productToEdit: Product = {
    id: 0,
    name: '',
    price: 0,
    count: 0,
    comment: '',
    leadId: 0,
    service: false
  }

  createProductFlag: boolean = false;
  productToCreate: Product = {
    id: 0,
    name: '',
    price: 0,
    count: 0,
    comment: '',
    leadId: 0,
    service: false
  }
  emptyProduct: Product = {
    id: 0,
    name: '',
    price: 0,
    count: 0,
    comment: '',
    leadId: 0,
    service: false
  }

  sortByCostAscFlag = true;
  sortByCostDescFlag = false;

  constructor(
    private http: HttpClient, 
    private messageServ: MessageService, 
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getStatuses();
    this.onSelectAllStatutes()
  }

  salesData = {
    labels: [''],
    datasets: [{ label: 'Прибыль', data: [0] }, { label: 'Оборот', data: [0] }, { label: 'Закупка', data: [0] }],
  };

  chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Ежемесячные продажи',
      },
    },
  };

  onCreateStatistics(): void {
    this.selectedLeads = undefined
    this.editLeadFlag = false
    this.createLeadFlag = false
    this.editProductFlag = false
    this.createProductFlag = false
    this.http.get<IncomePerMonth[]>(this.allLeadsIncomeURL)
              .subscribe(incomePerMonth => {
                this.incomePerMonth = incomePerMonth
                this.salesData.labels = incomePerMonth.map(i => `${i.year}-${i.month}`)
                this.salesData.datasets[0] = {label: 'Прибыль', data: incomePerMonth.map(i => i.totalIncome)}
                this.salesData.datasets[1] = {label: 'Оборот', data: incomePerMonth.map(i => i.totalCost)}
                this.salesData.datasets[2] = {label: 'Закупка', data: incomePerMonth.map(i => i.totalTradePrice)}
                this.showStatisticsFlag = true;
              } );
  }

  getStatuses(): void {
    this.http.get<Status[]>(this.allStatusesURL)
              .subscribe(statuses => this.statuses = statuses);
  }

  onSelectAllStatutes(): void {
    this.showStatisticsFlag = false;
    this.createLeadFlag = false
    this.editLeadFlag = false
    this.editProductFlag = false
    this.selectedStatus = undefined
    this.http.get<Lead[]>(this.allLeadsURL)
      .subscribe(leads => {
        this.clonedSelectedLeads = [...leads]
        this.selectedLeads = leads
        if (this.sortByCostAscFlag) {
          this.sortByCostAsc()
        } else if (this.sortByCostDescFlag) {
          this.sortByCostDesc()
        }
      })
  }

  onSelectStatus(status: Status): void {
    this.selectedStatus = status

    this.showStatisticsFlag = false;
    this.createLeadFlag = false
    this.editLeadFlag = false
    this.editProductFlag = false

    this.http.get<Lead[]>(this.allLeadsByStatusIdURL + status.id)
      .subscribe(leads => {
        this.clonedSelectedLeads = [...leads]
        this.selectedLeads = leads
        if (this.sortByCostAscFlag) {
          this.sortByCostAsc()
        } else if (this.sortByCostDescFlag) {
          this.sortByCostDesc()
        }
      })
  }

  onCreateLead(): void {
    this.leadToCreate = structuredClone(this.emptyLead);
    this.selectedLeads = undefined
    this.editLeadFlag = false
    this.createLeadFlag = true
    this.editProductFlag = false
    this.createProductFlag = false
    this.showStatisticsFlag = false
    this.statusOfLeadToCreate.name = this.statuses[0].name
  }

  onSaveLead(): void {
    var foundStatus = this.statuses.filter(status => status.name == this.statusOfLeadToCreate.name)[0]
    this.leadToCreate.status = structuredClone(foundStatus)

    var today = new Date()
    var dd = String(today.getDate()).padStart(2, '0')
    var mm = String(today.getMonth() + 1).padStart(2, '0')
    var yyyy = today.getFullYear()
    this.leadToCreate.creationDate = yyyy + '-' + mm + '-' + dd

    this.http.post<Lead>(this.saveLeadURL, this.leadToCreate)
      .subscribe(lead => {
        this.leadToEdit = lead
        this.selectedStatus = structuredClone(foundStatus)
        this.onEditLead(structuredClone(this.leadToEdit))
      })
    this.messageServ.add(`Новый Лид ${this.leadToCreate.firstName} ${this.leadToCreate.lastName} был создан`)
    this.dialog.open(MessagesComponent)
  }

  onEditLead(lead: Lead): void {
    if (this.selectedStatus) {
      this.productsOfLeadToUpdate = []
      this.selectedLeads = undefined
      this.createLeadFlag = false
      this.editProductFlag = false
      this.createProductFlag = false
      this.showStatisticsFlag = false
      this.editLeadFlag = true

      this.leadToEdit = lead
      this.statusOfLeadToUpdate = structuredClone(this.selectedStatus)
      this.http.get<Product[]>(this.allProductsByLeadIdURL + this.leadToEdit.id)
                .subscribe(products => this.productsOfLeadToUpdate = products)
    }
  }

  onUpdateLead(): void {
    var foundStatus = this.statuses.filter(status => status.name == this.statusOfLeadToUpdate.name)[0]
    this.leadToEdit.status = structuredClone(foundStatus)
    this.http.put<Lead>(this.editLeadURL, this.leadToEdit)
      .subscribe(obj => obj)
    this.messageServ.add(`Лид ${this.leadToEdit.firstName} ${this.leadToEdit.lastName} был успешно сохранен`)
    this.dialog.open(MessagesComponent)
  }

  onEditProduct(product: Product): void {
    this.editProductFlag = true
    this.createProductFlag = false
    this.productToEdit = structuredClone(product)
  }

  onUpdateProduct(): void {
    this.http.put<Product>(this.editProductURL, this.productToEdit)
              .subscribe(obj => obj)
    this.productsOfLeadToUpdate = this.productsOfLeadToUpdate.filter(p => p.id != this.productToEdit.id)
    this.productsOfLeadToUpdate.push(structuredClone(this.productToEdit))
    this.editProductFlag = false
    let cloned = [...this.productsOfLeadToUpdate]
    this.productsOfLeadToUpdate = cloned
  }

  onDeleteProduct(): void {
    this.http.delete(this.deleteProductURL + this.productToEdit.id).subscribe(obj => obj)
    this.productsOfLeadToUpdate = this.productsOfLeadToUpdate.filter(p => p.id != this.productToEdit.id)
    this.editProductFlag = false
  }

  onCreateProduct(): void {
    this.productToCreate = structuredClone(this.emptyProduct)
    this.createProductFlag = true
    this.editProductFlag = false
  }

  onCreateCP(): void {
    let headers = new HttpHeaders()
    headers = headers.set('Accept', 'application/pdf')
    let params = new HttpParams()
    params = params.set('discount', this.leadToEdit.discount)
    this.http.get(this.exportPdfProductURL + this.leadToEdit.id, { headers: headers, params: params, responseType: 'blob'})
      .subscribe((data) => {
          var blob = new Blob([data], {type: 'application/pdf'});
          const fileURL = URL.createObjectURL(blob);
          window.open(fileURL, '_blank', 'width=1000, height=800');
      })
  }

  onSaveProduct(): void {
    this.productToCreate.leadId = this.leadToEdit.id
    this.http.post<Product>(this.saveProductURL, this.productToCreate)
              .subscribe(product => this.productToCreate = product)
    this.productsOfLeadToUpdate.push(structuredClone(this.productToCreate))
    let cloned = [...this.productsOfLeadToUpdate]
    this.productsOfLeadToUpdate = cloned
    this.createProductFlag = false
  }

  getTotalCost(): number {
    return this.getTotalCostOfProducts(this.productsOfLeadToUpdate)
  }

  getTotalCostWithDiscount(): number {
    return this.getTotalCostWithDiscountOfProducts(this.productsOfLeadToUpdate, this.leadToEdit.discount)
  }

  getTotalCostOfProducts(products: Product[]): number {
    let result = products
      .map(p => p.price * p.count)
      .reduce((prev, curr) => (prev + curr), 0)
    return Math.round(result * 100) / 100
  }

  getTotalCostWithDiscountOfProducts(products: Product[], discount: number): number {
    let result = this.getTotalCostOfProducts(products)
    let afterDiscount = (1 - discount / 100)
    return Math.round(result * afterDiscount * 100) / 100
  }

  searchByPhoneNumber(event: Event) {
    if (this.selectedLeads) {
      const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
      let filtered = this.clonedSelectedLeads.filter(lead => lead.phone.startsWith(filterValue))
      this.selectedLeads = filtered
    }
  }

  sortByCostAsc(): void {
    this.sortByCostAscFlag = true;
    this.sortByCostDescFlag = false;
    let sorted = this.clonedSelectedLeads
      .sort((x, y) => this.getTotalCostOfProducts(x.products) - this.getTotalCostOfProducts(y.products))
    let cloned = [...sorted]
    this.selectedLeads = cloned
  }

  sortByCostDesc(): void {
    this.sortByCostDescFlag = true;
    this.sortByCostAscFlag = false;
    let sorted = this.clonedSelectedLeads
      .sort((x, y) => this.getTotalCostOfProducts(y.products) - this.getTotalCostOfProducts(x.products))
    let cloned = [...sorted]
    this.selectedLeads = cloned
  }
}
