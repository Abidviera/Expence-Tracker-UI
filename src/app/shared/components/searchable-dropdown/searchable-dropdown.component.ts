import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-searchable-dropdown',
  standalone: false,
  templateUrl: './searchable-dropdown.component.html',
  styleUrl: './searchable-dropdown.component.scss',
})
export class SearchableDropdownComponent {
  @Input() options: any[] = [];
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() placeholder: string = 'Select an option';
  @Input() required: boolean = false;
  @Input() label: string = '';
  
  @Output() selectionChange = new EventEmitter<any>();
  
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('dropdown') dropdown!: ElementRef;
  
  isOpen = false;
  filteredOptions: any[] = [];
  searchText = '';
  selectedOption: any = null;
  
  private onChange: any = () => {};
  private onTouched: any = () => {};
  
  constructor() {}
  
  ngOnInit() {
    this.filteredOptions = [...this.options];
  }
  
  ngOnChanges() {
    this.filteredOptions = [...this.options];
    this.filterOptions();
  }
  
  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 0);
    }
  }
  
  filterOptions() {
    if (!this.searchText) {
      this.filteredOptions = [...this.options];
    } else {
      this.filteredOptions = this.options.filter(option =>
        option[this.optionLabel].toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  }
  
  selectOption(option: any) {
    this.selectedOption = option;
    this.searchText = option[this.optionLabel];
    this.onChange(option[this.optionValue]);
    this.selectionChange.emit(option);
    this.isOpen = false;
  }
  
  writeValue(value: any): void {
    if (value) {
      const selected = this.options.find(option => option[this.optionValue] === value);
      if (selected) {
        this.selectedOption = selected;
        this.searchText = selected[this.optionLabel];
      }
    }
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.dropdown.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
