import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { ErrorsModule } from 'app/main/apps/errors/errors.module'


const routes = [
    {
        path        : 'e-commerce',
        loadChildren: './e-commerce/e-commerce.module#EcommerceModule'
    },
    {
        path : 'errors',
        loadChildren : './errors/errors.module#ErrorsModule'
    }
];

@NgModule({
    imports     : [
        RouterModule.forChild(routes),
        FuseSharedModule,
        ErrorsModule
    ]
})
export class AppsModule
{
}
