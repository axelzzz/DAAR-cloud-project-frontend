import { Component, OnInit } from '@angular/core';

import { Book } from '../models/Book';
import { SearchEngineService } from '../services/search-engine.service';
import { DataHandlerService } from '../services/data-handler.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  books = [];
  booksSuggestion = [];
  pattern = "";

  showSuggestion = false;
  hasSearched = false;

  isSearchByTitle = false;
  isSearchByAuthor = false;
  isSearchByReleaseDate = false;
  isSearchByPostingDate = false;
  isSearchByLanguage = false;
  isSearchInCurrentBooks = false;

  isBetweenness = false;
  isPageRank = false;
  isMix = false;

  constructor(private searchEngineService: SearchEngineService,
              private dataHandlerService: DataHandlerService,
              private spinner: NgxSpinnerService) { }


  ngOnInit(): void {
    this.getBooks();
    
  }


  getBooks() {
    this.spinner.show();
    this.searchEngineService.getBooksMetadata()
    .subscribe(books => {
      this.books = books;
      this.spinner.hide();
    });
  }


  filter(pattern: string) {
    
    this.pattern = pattern;
    this.showSuggestion = false;
    this.booksSuggestion = [];
    this.hasSearched = true;
    this.spinner.show();
    if(! (this.isSearchByTitle 
       || this.isSearchByAuthor
       || this.isSearchByReleaseDate
       || this.isSearchByPostingDate
       || this.isSearchByLanguage) ) {

        this.searchEngineService.filter(pattern, this.isBetweenness, this.isPageRank, this.isMix)
          .subscribe(books => {
            this.books = books;
            this.spinner.hide();
          },
          error => {
            console.error("error at filter");
            this.spinner.hide();
          });
    }

    else {
      
      this.searchEngineService
      .filterCriterias(pattern,
                    this.isSearchByTitle,
                    this.isSearchByAuthor,
                    this.isSearchByReleaseDate,
                    this.isSearchByPostingDate,
                    this.isSearchByLanguage,
                    this.isBetweenness,
                    this.isPageRank,
                    this.isMix)
                    .subscribe(books => {
                      this.books = books;
                      this.spinner.hide();
                    },
                    error => {
                      console.error("error at filter");
                      this.spinner.hide();
                    });
    }     
  }


  fetchBook(book:Book) { 
    this.showSuggestion = true;
    this.searchEngineService.fetchBook(book.nameFile)
    .subscribe(content => {            
      book.content = content;
      this.dataHandlerService.changeBook([book.content, this.pattern]);      
    },
    error => {
      console.error("Book not found, trying with other name file ");
      this.fetchBookAttemptWithModifiedName(book);
    });
    
    this.searchEngineService.getSuggestions(book.nameFile)
    .subscribe(suggestions => {
      this.booksSuggestion = suggestions;
    });
    
  }
  

  fetchBookAttemptWithModifiedName(book:Book) { 
   
    book.nameFile = book.nameFile.replace(".txt.utf-8",".txt")   
    
    this.searchEngineService.fetchBook(book.nameFile)
    .subscribe(content => {      
      book.content = content;
      this.dataHandlerService.changeBook([book.content, this.pattern]);      
    },
    error => {
      console.error("Book modified not found ", error);
    });  
    
    this.searchEngineService.getSuggestions(book.nameFile)
    .subscribe(suggestions => {
      this.booksSuggestion = suggestions;      
    });
  }

  getWidth() {
    if(this.booksSuggestion.length > 0){ 
      return '50%';
    }
  }

  getFloat() {    
    if(this.booksSuggestion.length > 0){   
      return 'left';
    }
  }
}
