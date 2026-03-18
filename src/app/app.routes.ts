import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './services/auth';

const isAuthenticated = () => {
  const _authService = inject(AuthService);
  const _router = inject(Router);
  return _authService.getConnectedUser().pipe(
    map((user) => {
      if (!user) _router.navigateByUrl('/login');
      return Boolean(user);
    }),
  );
};

export const routes: Routes = [
  {
    path: '',
    canActivate: [isAuthenticated],
    children: [
      {
        path: '',
        redirectTo: '/quizzes',
        pathMatch: 'full',
      },
      {
        path: 'quizzes',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'quizz-detail',
        loadComponent: () =>
          import('./quizz-detail/quizz-detail.page').then(m => m.QuizzDetailPage),
      },
      {
        path: 'question/:code',
        loadComponent: () =>
          import('./quizz-game/question.page').then((m) => m.QuestionPage),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'password-retrieve',
    loadComponent: () =>
      import('./auth/password-retrieve.page').then((m) => m.PasswordRetrievePage),
  },
  {
    path: '',
    redirectTo: '/quizzes',
    pathMatch: 'full',
  },
];
