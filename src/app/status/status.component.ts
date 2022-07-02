import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Status } from '../model/status';
import { Lead } from '../model/lead';
import { Product } from '../model/product';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

  displayedLeadColumns: string[] = ['firstName', 'lastName', 'phone', 'address', 'email', 
                                'storage', 'tradePrice', 'discount', 'creationDate', 'status'];
  displayedProductColumns: string[] = ['name', 'price', 'count', 'comment', 'cost']
  
  private allStatusesURL = 'http://localhost:8080/api/v1/status/all'
  
  private allLeadsURL = 'http://localhost:8080/api/v1/lead/all'
  private allLeadsByStatusIdURL = 'http://localhost:8080/api/v1/lead/all/status/'
  private saveLeadURL = 'http://localhost:8080/api/v1/lead/create'
  private editLeadURL = 'http://localhost:8080/api/v1/lead/edit'

  private allProductsByLeadIdURL = 'http://localhost:8080/api/v1/product/all/lead/'
  private editProductURL = 'http://localhost:8080/api/v1/product/edit'
  private saveProductURL = 'http://localhost:8080/api/v1/product/create'

  statuses: Status[] = []
  selectedLeads?: Lead[]
  selectedStatus?: Status

  createLeadFlag: boolean = false;
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
    tradePrice: 0,
    discount: 0,
    status: undefined,
    creationDate: ''
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
    tradePrice: 0,
    discount: 0,
    status: undefined,
    creationDate: ''
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

  constructor(
    private http: HttpClient) { }

  ngOnInit(): void {
    this.getStatuses();
    this.onSelectAllStatutes()
  }

  getStatuses(): void {
    this.http.get<Status[]>(this.allStatusesURL)
              .subscribe(statuses => this.statuses = statuses);
  }

  onSelectAllStatutes(): void {
    this.createLeadFlag = false
    this.editLeadFlag = false
    this.editProductFlag = false
    this.selectedStatus = undefined
    this.http.get<Lead[]>(this.allLeadsURL)
              .subscribe(leads => this.selectedLeads = leads)
  }

  onSelectStatus(status: Status): void {
    this.selectedStatus = status
    this.createLeadFlag = false
    this.editLeadFlag = false
    this.editProductFlag = false
    this.http.get<Lead[]>(this.allLeadsByStatusIdURL + status.id)
              .subscribe(leads => this.selectedLeads = leads)
  }

  onCreateLead(): void {
    this.selectedLeads = undefined
    this.editLeadFlag = false
    this.createLeadFlag = true
    this.editProductFlag = false
    this.createProductFlag = false
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
              .subscribe(obj => obj)
  }

  onEditLead(lead: Lead): void {
    if (this.selectedStatus) {
      this.selectedLeads = undefined
      this.createLeadFlag = false
      this.editProductFlag = false
      this.createProductFlag = false
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
    this.productsOfLeadToUpdate.push(this.productToEdit)
  }

  onCreateProduct(): void {
    this.createProductFlag = true
    this.editProductFlag = false
  }

  onSaveProduct(): void {
    this.productToCreate.leadId = this.leadToEdit.id
    this.http.post<Product>(this.saveProductURL, this.productToCreate)
              .subscribe(product => this.productToCreate = product)
    this.productsOfLeadToUpdate.push(this.productToCreate)
    let cloned = [...this.productsOfLeadToUpdate]
    this.productsOfLeadToUpdate = cloned
  }
}
