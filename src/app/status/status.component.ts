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
                                'storage', 'tradePrice', 'discount', 'creationDate'];

  private allStatusesURL = 'http://localhost:8080/api/v1/status/all'
  private allLeadsURL = 'http://localhost:8080/api/v1/lead/all'
  private allLeadsByStatusIdURL = 'http://localhost:8080/api/v1/lead/all/status/'
  
  statuses: Status[] = []
  selectedLeads?: Lead[]

  createLeadFlag: boolean = false;
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

  constructor(
    private http: HttpClient) { }

  ngOnInit(): void {
    this.getStatuses();
  }

  getStatuses(): void {
    this.http.get<Status[]>(this.allStatusesURL)
              .subscribe(statuses => this.statuses = statuses);
  }

  onSelectAllStatutes(): void {
    this.createLeadFlag = false;
    this.http.get<Lead[]>(this.allLeadsURL)
              .subscribe(leads => this.selectedLeads = leads)
  }

  onSelectStatus(status: Status): void {
    this.createLeadFlag = false;
    this.http.get<Lead[]>(this.allLeadsByStatusIdURL + status.id)
              .subscribe(leads => this.selectedLeads = leads)
  }

  createLead(): void {
    this.selectedLeads = undefined;
    this.createLeadFlag = true;
  }

}
