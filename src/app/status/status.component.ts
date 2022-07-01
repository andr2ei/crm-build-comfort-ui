import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Status } from '../model/status';
import { Lead } from '../model/lead';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

  displayedColumns: string[] = ['firstName', 'lastName', 'phone', 'address', 'email', 
                                'storage', 'tradePrice', 'discount', 'creationDate', 'status'];

  private allStatusesURL = 'http://localhost:8080/api/v1/status/all'
  
  private allLeadsURL = 'http://localhost:8080/api/v1/lead/all'
  private allLeadsByStatusIdURL = 'http://localhost:8080/api/v1/lead/all/status/'
  private saveLeadURL = 'http://localhost:8080/api/v1/lead/create'
  private editLeadURL = 'http://localhost:8080/api/v1/lead/edit'

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
    this.selectedStatus = undefined
    this.http.get<Lead[]>(this.allLeadsURL)
              .subscribe(leads => this.selectedLeads = leads)
  }

  onSelectStatus(status: Status): void {
    this.selectedStatus = status
    this.createLeadFlag = false
    this.editLeadFlag = false
    this.http.get<Lead[]>(this.allLeadsByStatusIdURL + status.id)
              .subscribe(leads => this.selectedLeads = leads)
  }

  createLead(): void {
    this.selectedLeads = undefined
    this.editLeadFlag = false
    this.createLeadFlag = true
  }

  saveLead(): void {
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
      this.editLeadFlag = true

      this.leadToEdit = lead
      this.statusOfLeadToUpdate = structuredClone(this.selectedStatus)
    }
  }

  onUpdateLead(): void {
    var foundStatus = this.statuses.filter(status => status.name == this.statusOfLeadToUpdate.name)[0]
    this.leadToEdit.status = structuredClone(foundStatus)
    this.http.put<Lead>(this.editLeadURL, this.leadToEdit)
              .subscribe(obj => obj)
  }

}
