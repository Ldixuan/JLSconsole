import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { ErrorsModule } from 'app/main/apps/errors/errors.module';

const routes = [
    {
        path        : 'chat',
        loadChildren: './chat/chat.module#ChatModule'
    },
    {
        path        : 'dashboards/project',
        loadChildren: './dashboards/project/project.module#ProjectDashboardModule'
    },
    {
        path: 'e-commerce',
        loadChildren: './e-commerce/e-commerce.module#EcommerceModule'
    },
    {
        path: 'reference',
        loadChildren: './reference/reference.module#ReferenceModule'
    },
    {
        path: 'user',
        loadChildren: './user/user.module#UserModule'
    },
    {
        path: 'errors',
        loadChildren: './errors/errors.module#ErrorsModule'
    },
    {
        path: '',
        loadChildren: './dashboards/project/project.module#ProjectDashboardModule'
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        FuseSharedModule,
        ErrorsModule
    ]
    })
export class AppsModule {
}
