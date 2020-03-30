import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';

import { locale as english } from './i18n/en';
import { locale as chinese } from './i18n/cn';
import { locale as french } from './i18n/fr';

//import { EcommerceProductsService } from 'app/main/apps/e-commerce/products/products.service';
import { ProductService } from 'app/Services/product.service';
import { ReferenceService } from 'app/Services/reference.service'
import { takeUntil } from 'rxjs/internal/operators';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { ActivatedRoute, Params } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { MatSnackBar } from '@angular/material';

@Component({
    selector: 'e-commerce-products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class EcommerceProductsComponent implements OnInit {
    displayedColumns = ['action', 'reference', 'image', 'name', 'MainCategory', 'SecondCategory', 'price', 'active'];
    //imageRoot = this._ecommerceProductsService.host + "images/";

    private environment = environment;
    public view: string = "products";

    private totalCount: number = 0;

    private productList: any[] = [];

    private mainCategoryList: any[];
    private secondCategoryList: any[];
    private referenceItemList: any[];
    private statusList: any[] = [{
        Value: true,
        Label: 'Valide'
    }, {
        Value: false,
        Label: 'Invalide'
    }
    ];

    private searchCriteria = {
        MainCategoryReferenceId: 0,
        SecondCategoryReferenceId: [],
        Validity: true,
        ProductLabel: '',
        begin: 0,
        step: 10,
        Lang: ''
    };



    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('filter', { static: true })
    filter: ElementRef;


    constructor(
        private referenceService: ReferenceService,
        private productService: ProductService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _translateService: TranslateService,
        private _fuseProgressBarService: FuseProgressBarService,
        private activeRoute: ActivatedRoute,
        private _matSnackBar: MatSnackBar,
    ) {
        this._fuseTranslationLoaderService.loadTranslations(english, chinese, french);
    }


    ngOnInit(): void {
        var criteriaStringfy = localStorage.getItem('ProductCriteria');
        if(criteriaStringfy!=null){
            this.searchCriteria = JSON.parse(criteriaStringfy);

            localStorage.removeItem('ProductCriteria');
            this.search();
        }

        this.initLoadData();
    }

    initLoadData() {
        var criteria = {
            Lang: this._translateService.currentLang,
            ShortLabels: ['MainCategory', 'SecondCategory']
        };
        this.referenceService.getReferenceItemsByCategoryLabels(criteria).subscribe(result => {
            if (result != null && result.length > 0) {
                this.referenceItemList = result;
                this.mainCategoryList = result.filter(p => p.ReferenceCategoryLabel == "MainCategory");
            }
        },
            error => {
                // todo 
            });
    }

    getSecondCategoryList() {
        if (this.searchCriteria.MainCategoryReferenceId != null && this.searchCriteria.MainCategoryReferenceId != 0 && this.referenceItemList!=null ) {
            return this.referenceItemList.filter(p => p.ParentId == this.searchCriteria.MainCategoryReferenceId);
        }
        return [];
    }

    /* At least main category or search is fill to lauch search */
    checkIfConditionIsFill() {
        if (this.searchCriteria.ProductLabel != '' || this.searchCriteria.MainCategoryReferenceId != 0) {
            return false;
        }
        return true;
    }

    AddProductIntoCart(Product, event) {
        event.preventDefault();
        event.stopPropagation();
        var cartStringfy = localStorage.getItem('cart');
        if (cartStringfy != null) {
            var cartObject = JSON.parse(cartStringfy);
            if (cartObject != null && cartStringfy.length > 0) {
                // Existant products 
                cartObject.forEach(p => {
                    if (p.ReferenceId == Product.ReferenceId) {
                        p.Quantity = p.Quantity + 1;
                    }
                });
                // New product
                if (cartObject.findIndex(p => p.ReferenceId == Product.ReferenceId) == -1) {
                    Product.Quantity = 1;
                    cartObject.push(Product);
                }
            }
            else {
                Product.Quantity = 1;
                cartObject.push(Product);
            }
        }
        else {
            cartObject = [];
            Product.Quantity = 1;
            cartObject.push(Product);
        }
        localStorage.setItem('cart', JSON.stringify(cartObject));

        this._matSnackBar.open(this._translateService.instant('products.Msg_AddProductIntoCart'), 'OK', { // todo translate
            duration        : 2000,
            verticalPosition: 'top'
        });
    }


    search() {
        this._fuseProgressBarService.show();
        this.searchCriteria.Lang = this._translateService.currentLang;
        this.productService.AdvancedProductSearchByCriteria(this.searchCriteria).subscribe(result => {
            if (result != null) {
                this.productList = result.ProductList;
                this.totalCount = result.TotalCount;

                console.log(this.productList);
                this._fuseProgressBarService.hide();
            }

        },
            error => {

            });
    }

    getServerData(event) {
        this.searchCriteria.begin = event.pageIndex;
        this.searchCriteria.step = event.pageSize;
        this.search();
    }

    sortData(event) {
        // todo implement the logic 
        console.log(event);
    }

    saveCriteria(){
        localStorage.setItem('ProductCriteria', JSON.stringify(this.searchCriteria));
    }
}


