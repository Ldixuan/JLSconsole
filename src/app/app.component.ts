import { Component, Inject, OnDestroy, OnInit, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@angular/cdk/platform';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';

import { navigation } from 'app/navigation/navigation';
import { locale as navigationEnglish } from 'app/navigation/i18n/en';
import { locale as navigationChinese } from 'app/navigation/i18n/cn';
import { locale as navigationFrench } from 'app/navigation/i18n/fr';

import { ChatService } from 'app/Services/chat.service';
import { Message } from './Services/message';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    fuseConfig: any;
    navigation: any;

    // public
    public _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {DOCUMENT} document
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseNavigationService} _fuseNavigationService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {FuseSplashScreenService} _fuseSplashScreenService
     * @param {FuseTranslationLoaderService} _fuseTranslationLoaderService
     * @param {Platform} _platform
     * @param {TranslateService} _translateService
     */
    constructor(
        @Inject(DOCUMENT) public document: any,
        public _fuseConfigService: FuseConfigService,
        public _fuseNavigationService: FuseNavigationService,
        public _fuseSidebarService: FuseSidebarService,
        public _fuseSplashScreenService: FuseSplashScreenService,
        public _fuseTranslationLoaderService: FuseTranslationLoaderService,
        public _translateService: TranslateService,
        public _platform: Platform,
        public chatService: ChatService, 
        public _ngZone: NgZone,
        public _snackBar: MatSnackBar
    ) {
        // Get default navigation
        this.navigation = navigation;

        // Register the navigation to the service
        this._fuseNavigationService.register('main', this.navigation);

        // Set the main navigation as our current navigation
        this._fuseNavigationService.setCurrentNavigation('main');

        // Add languages
        this._translateService.addLangs(['en', 'cn', 'fr']);

        // Set the default language
        this._translateService.setDefaultLang('fr');

        // Set the navigation translations
        this._fuseTranslationLoaderService.loadTranslations(navigationEnglish, navigationChinese, navigationFrench);

        if(localStorage.getItem('Lang')!=null){
            this._translateService.use(localStorage.getItem('Lang'));
        }
        else{
            // Use a language
            this._translateService.use('fr');
        }
       

        /**
         * ----------------------------------------------------------------------------------------------------
         * ngxTranslate Fix Start
         * ----------------------------------------------------------------------------------------------------
         */

        /**
         * If you are using a language other than the default one, i.e. Turkish in this case,
         * you may encounter an issue where some of the components are not actually being
         * translated when your app first initialized.
         *
         * This is related to ngxTranslate module and below there is a temporary fix while we
         * are moving the multi language implementation over to the Angular's core language
         * service.
         **/

        // Set the default language to 'en' and then back to 'tr'.
        // '.use' cannot be used here as ngxTranslate won't switch to a language that's already
        // been selected and there is no way to force it, so we overcome the issue by switching
        // the default language back and forth.

        setTimeout(() => {
            this._translateService.setDefaultLang('en');
            this._translateService.setDefaultLang('cn');
            this._translateService.setDefaultLang('fr');
        });


        /**
         * ----------------------------------------------------------------------------------------------------
         * ngxTranslate Fix End
         * ----------------------------------------------------------------------------------------------------
         */

        // Add is-mobile class to the body if the platform is mobile
        if (this._platform.ANDROID || this._platform.IOS) {
            this.document.body.classList.add('is-mobile');
        }

        // Set the public defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {

                this.fuseConfig = config;

                // Boxed
                if (this.fuseConfig.layout.width === 'boxed') {
                    this.document.body.classList.add('boxed');
                }
                else {
                    this.document.body.classList.remove('boxed');
                }

                // Color theme - Use normal for loop for IE11 compatibility
                for (let i = 0; i < this.document.body.classList.length; i++) {
                    const className = this.document.body.classList[i];

                    if (className.startsWith('theme-')) {
                        this.document.body.classList.remove(className);
                    }
                }

                this.document.body.classList.add(this.fuseConfig.colorTheme);
            });

        // subscribe to message receiver 
        this.chatService.messageReceived.subscribe((message: Message) => {
            this._ngZone.run(() => {
                message.type = "received";
                /* Step 1: show a toast */
                let snackBarRef = this._snackBar.open('Message archived', 'ok',{
                    duration: 2000
                  });
                /* Step 2: show badge in an icon */

                // todo change
                console.log(message);
            });
        });    

        // get not readed message 

        this.chatService.GetNoReadedDialog({UserId: localStorage.getItem('userId')}).subscribe(p=>{
            if(p!=null && p.length>0){
                this.chatService.noReadMessageSubject.next(p);
                localStorage.setItem('noReadMessage', JSON.stringify(p));
            }
        });

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key): void {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }
}
