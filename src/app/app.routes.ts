import { ActivatedRoute, ActivatedRouteSnapshot, ResolveFn, Routes } from '@angular/router';

import { AuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { AboutComponent } from './views/about/about.component';
import { ClipComponent } from './views/clip/clip.component';
import { HomeComponent } from './views/home/home.component';
import { ManageComponent } from './views/manage/manage.component';
import { NotFoundComponent } from './views/not-found/not-found.component';
import { UploadComponent } from './views/upload/upload.component';
import { Clip } from './models/clip';
import { inject } from '@angular/core';
import { ClipService } from './services/clip.service';

const redirectUnauthorizedToHome = () => redirectUnauthorizedTo('/');

const clipResolver: ResolveFn<Clip | null> = (route: ActivatedRouteSnapshot) => {
  return inject(ClipService).resolve(route.paramMap.get('id')!);
};

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'manage',
    component: ManageComponent,
    data: {
      authOnly: true,
      authGuardPipe: redirectUnauthorizedToHome,
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'upload',
    component: UploadComponent,
    data: {
      authOnly: true,
      authGuardPipe: redirectUnauthorizedToHome,
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'clip/:id',
    component: ClipComponent,
    resolve: {
      clip: clipResolver,
    },
  },
  {
    path: 'manage-clips',
    redirectTo: '/manage',
  },
  {
    path: '**',
    component: NotFoundComponent,
  }
];
