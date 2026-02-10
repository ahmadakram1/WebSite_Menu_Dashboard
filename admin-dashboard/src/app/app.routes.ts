import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CanActivateFn, Routes, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { timeout } from 'rxjs';

import { DashboardLayoutComponent } from './core/layout/dashboard-layout/dashboard-layout.component';
import { LanguageService, TranslatePipe } from './core/i18n/language.service';
import { API_BASE } from './core/api';
import { authRoutes } from './features/auth/auth.routes';

const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  try {
    const token =
      localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      return true;
    }
  } catch {
    // Ignore storage errors and treat as unauthenticated.
  }
  return router.parseUrl('/login');
};

const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return fallback;
      }
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage errors for mock flow.
    }
  }
};

function authHeaders(): HttpHeaders {
  try {
    const token =
      localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  } catch {
    return new HttpHeaders();
  }
}

function imageUrl(filename?: string | null): string {
  return filename ? `${API_BASE}/uploads/${filename}` : '';
}

interface RestaurantSettings {
  id?: number;
  name_ar: string;
  name_en: string;
  logo: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  theme_bg?: string | null;
  theme_card?: string | null;
  theme_text?: string | null;
  theme_muted?: string | null;
  theme_accent?: string | null;
  theme_accent2?: string | null;
  theme_border?: string | null;
  font_family?: string | null;
  logo_preview?: string;
  logo_file?: File | null;
}

interface Category {
  id: number;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  image: string;
  image_preview?: string;
  image_file?: File | null;
}

interface Item {
  id: number;
  category_id: number | null;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number | null;
  image: string;
  image_preview?: string;
  image_file?: File | null;
}


@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [MatCardModule, TranslatePipe],
  template: `
    <div class="dashboard-grid">
      <mat-card class="dashboard-card">{{ 'DASHBOARD.HOME' | t }}</mat-card>
      <mat-card class="dashboard-card">{{ 'DASHBOARD.SETTINGS' | t }}</mat-card>
      <mat-card class="dashboard-card">{{ 'DASHBOARD.CATEGORIES' | t }}</mat-card>
      <mat-card class="dashboard-card">{{ 'DASHBOARD.ITEMS' | t }}</mat-card>
    </div>
  `
})
class DashboardHomeComponent {}


@Component({
  selector: 'app-restaurant-settings',
  standalone: true,
  imports: [
    TranslatePipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormsModule,
    NgIf
  ],
  template: `
    <mat-card class="page-card">
      <mat-card-title>{{ 'SETTINGS.TITLE' | t }}</mat-card-title>
      <mat-card-content>
        <div class="loading-center" *ngIf="loading">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        </div>
        <form class="form-grid" (ngSubmit)="save()" *ngIf="!loading">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'SETTINGS.NAME_AR' | t }}</mat-label>
            <input matInput name="name_ar" [(ngModel)]="model.name_ar" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'SETTINGS.NAME_EN' | t }}</mat-label>
            <input matInput name="name_en" [(ngModel)]="model.name_en" />
          </mat-form-field>

          <div>
            <label>{{ 'SETTINGS.LOGO' | t }}</label>
            <input type="file" accept="image/*" (change)="onLogoSelected($event)" />
          </div>

          <div class="image-preview" *ngIf="model.logo_preview">
            <img [src]="model.logo_preview" alt="Logo preview" />
          </div>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'SETTINGS.PHONE' | t }}</mat-label>
            <input matInput name="phone" [(ngModel)]="model.phone" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'SETTINGS.WHATSAPP' | t }}</mat-label>
            <input matInput name="whatsapp" [(ngModel)]="model.whatsapp" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'SETTINGS.INSTAGRAM' | t }}</mat-label>
            <input matInput name="instagram" [(ngModel)]="model.instagram" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'SETTINGS.FONT' | t }}</mat-label>
            <mat-select name="font_family" [(ngModel)]="model.font_family">
              <mat-option [value]="''">{{ 'SETTINGS.FONT_DEFAULT' | t }}</mat-option>
              <mat-option *ngFor="let font of fonts" [value]="font.value">
                {{ font.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'SETTINGS.THEME_BG' | t }}</mat-label>
            <input matInput type="color" name="theme_bg" [(ngModel)]="model.theme_bg" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'SETTINGS.THEME_CARD' | t }}</mat-label>
            <input matInput type="color" name="theme_card" [(ngModel)]="model.theme_card" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'SETTINGS.THEME_TEXT' | t }}</mat-label>
            <input matInput type="color" name="theme_text" [(ngModel)]="model.theme_text" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'SETTINGS.THEME_MUTED' | t }}</mat-label>
            <input matInput type="color" name="theme_muted" [(ngModel)]="model.theme_muted" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'SETTINGS.THEME_ACCENT' | t }}</mat-label>
            <input matInput type="color" name="theme_accent" [(ngModel)]="model.theme_accent" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'SETTINGS.THEME_ACCENT2' | t }}</mat-label>
            <input matInput type="color" name="theme_accent2" [(ngModel)]="model.theme_accent2" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'SETTINGS.THEME_BORDER' | t }}</mat-label>
            <input matInput type="color" name="theme_border" [(ngModel)]="model.theme_border" />
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit">
              {{ 'COMMON.SAVE' | t }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
class RestaurantSettingsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);
  private readonly language = inject(LanguageService);
  loading = false;
  fonts = [
    { value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", label: 'System' },
    { value: "'Segoe UI', Arial, sans-serif", label: 'Segoe UI' },
    { value: "Roboto, Arial, sans-serif", label: 'Roboto' },
    { value: "Arial, sans-serif", label: 'Arial' }
  ];
  model: RestaurantSettings = {
    name_ar: '',
    name_en: '',
    logo: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    theme_bg: '#f5f6f8',
    theme_card: '#ffffff',
    theme_text: '#1f2937',
    theme_muted: '#6b7280',
    theme_accent: '#0f766e',
    theme_accent2: '#14b8a6',
    theme_border: '#e5e7eb',
    font_family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    logo_preview: '',
    logo_file: null
  };

  ngOnInit(): void {
    this.fetch();
  }

  private fetch(): void {
    this.loading = true;
    this.http
      .get<RestaurantSettings[]>(`${API_BASE}/admin/restaurants.php`, { headers: authHeaders() })
      .subscribe({
        next: (data) => {
          const first = data[0];
          if (first) {
            this.model = {
              ...first,
              logo_preview: imageUrl(first.logo),
              logo_file: null
            };
            storage.set('settings', {
              name_ar: first.name_ar,
              name_en: first.name_en,
              logo_data_url: imageUrl(first.logo),
              phone: first.phone,
              whatsapp: first.whatsapp,
              instagram: first.instagram,
              theme_bg: first.theme_bg,
              theme_card: first.theme_card,
              theme_text: first.theme_text,
              theme_muted: first.theme_muted,
              theme_accent: first.theme_accent,
              theme_accent2: first.theme_accent2,
              theme_border: first.theme_border,
              font_family: first.font_family
            });
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open(this.language.translate('COMMON.ERROR'), undefined, { duration: 2000 });
        }
      });
  }

  save(): void {
    const hasFile = !!this.model.logo_file;
    this.loading = true;

    if (this.model.id && !hasFile) {
      this.http
        .put(
          `${API_BASE}/admin/restaurants.php`,
          {
            id: this.model.id,
            name_ar: this.model.name_ar,
            name_en: this.model.name_en,
            phone: this.model.phone,
            whatsapp: this.model.whatsapp,
            instagram: this.model.instagram,
            theme_bg: this.model.theme_bg,
            theme_card: this.model.theme_card,
            theme_text: this.model.theme_text,
            theme_muted: this.model.theme_muted,
            theme_accent: this.model.theme_accent,
            theme_accent2: this.model.theme_accent2,
            theme_border: this.model.theme_border,
            font_family: this.model.font_family
          },
          { headers: authHeaders() }
        )
        .pipe(timeout(12000))
        .subscribe({
          next: () => {
            this.afterSave('COMMON.SAVED');
          },
          error: (error) => this.onError(error)
        });
      return;
    }

    const form = new FormData();
    if (this.model.id) {
      form.append('id', String(this.model.id));
      form.append('_method', 'PUT');
    }
    form.append('name_ar', this.model.name_ar);
    form.append('name_en', this.model.name_en);
    form.append('phone', this.model.phone);
    form.append('whatsapp', this.model.whatsapp);
    form.append('instagram', this.model.instagram);
    form.append('theme_bg', this.model.theme_bg || '');
    form.append('theme_card', this.model.theme_card || '');
    form.append('theme_text', this.model.theme_text || '');
    form.append('theme_muted', this.model.theme_muted || '');
    form.append('theme_accent', this.model.theme_accent || '');
    form.append('theme_accent2', this.model.theme_accent2 || '');
    form.append('theme_border', this.model.theme_border || '');
    form.append('font_family', this.model.font_family || '');
    if (this.model.logo_file) {
      form.append('logo', this.model.logo_file);
    }

    this.http
      .post(`${API_BASE}/admin/restaurants.php`, form, { headers: authHeaders() })
      .pipe(timeout(12000))
      .subscribe({
        next: () => {
          this.afterSave('COMMON.SAVED');
          this.fetch();
        },
        error: (error) => this.onError(error)
      });
  }

  private afterSave(messageKey: string): void {
    storage.set('settings', {
      name_ar: this.model.name_ar,
      name_en: this.model.name_en,
      logo_data_url: this.model.logo_preview || imageUrl(this.model.logo),
      phone: this.model.phone,
      whatsapp: this.model.whatsapp,
      instagram: this.model.instagram,
      theme_bg: this.model.theme_bg,
      theme_card: this.model.theme_card,
      theme_text: this.model.theme_text,
      theme_muted: this.model.theme_muted,
      theme_accent: this.model.theme_accent,
      theme_accent2: this.model.theme_accent2,
      theme_border: this.model.theme_border,
      font_family: this.model.font_family
    });
    this.loading = false;
    this.snackBar.open(this.language.translate(messageKey), undefined, { duration: 2000 });
  }

  private onError(error?: unknown): void {
    this.loading = false;
    const fallback = this.language.translate('COMMON.ERROR');
    const message =
      typeof error === 'object' && error && 'error' in error && typeof error.error === 'object'
        ? (error.error as { error?: string }).error || fallback
        : fallback;
    this.snackBar.open(message, undefined, { duration: 2500 });
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.model.logo_file = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.model.logo_preview = String(reader.result ?? '');
    };
    reader.readAsDataURL(file);
  }
}

interface CategoryDialogData {
  mode: 'create' | 'edit';
  category: Category;
}

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    TranslatePipe,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgIf
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'create' ? ('CATEGORIES.CREATE' | t) : ('CATEGORIES.EDIT' | t) }}
    </h2>
    <div mat-dialog-content>
      <form class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'CATEGORIES.NAME_AR' | t }}</mat-label>
          <input matInput name="name_ar" [(ngModel)]="category.name_ar" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'CATEGORIES.NAME_EN' | t }}</mat-label>
          <input matInput name="name_en" [(ngModel)]="category.name_en" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'CATEGORIES.DESC_AR' | t }}</mat-label>
          <input matInput name="desc_ar" [(ngModel)]="category.description_ar" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'CATEGORIES.DESC_EN' | t }}</mat-label>
          <input matInput name="desc_en" [(ngModel)]="category.description_en" />
        </mat-form-field>
        <div>
          <label>{{ 'CATEGORIES.IMAGE' | t }}</label>
          <input type="file" accept="image/*" (change)="onImageSelected($event)" />
        </div>
        <div class="image-preview" *ngIf="category.image_preview">
          <img [src]="category.image_preview" alt="Category preview" />
        </div>
      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button type="button" (click)="cancel()">{{ 'COMMON.CANCEL' | t }}</button>
      <button mat-raised-button color="primary" type="button" (click)="save()">
        {{ 'COMMON.SAVE' | t }}
      </button>
    </div>
  `
})
class CategoryDialogComponent {
  readonly data = inject(MAT_DIALOG_DATA) as CategoryDialogData;
  private readonly dialogRef = inject(MatDialogRef<CategoryDialogComponent>);
  category: Category = { ...this.data.category };

  save(): void {
    this.dialogRef.close(this.category);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.category.image_file = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.category.image_preview = String(reader.result ?? '');
    };
    reader.readAsDataURL(file);
  }
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    TranslatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NgFor,
    NgIf
  ],
  template: `
    <div class="page-toolbar">
      <h2>{{ 'CATEGORIES.TITLE' | t }}</h2>
      <button mat-raised-button color="primary" type="button" (click)="openCreate()">
        <mat-icon>add</mat-icon>
        {{ 'COMMON.ADD' | t }}
      </button>
    </div>

    <div class="loading-center" *ngIf="loading">
      <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
    </div>

    <div class="card-grid" *ngIf="!loading">
      <mat-card class="card-item" *ngFor="let category of categories">
        <div class="card-item-header">
          <div>
            <div class="card-item-title">{{ category.name_ar }} / {{ category.name_en }}</div>
            <div class="card-item-subtitle">{{ 'CATEGORIES.TITLE' | t }}</div>
          </div>
          <img
            *ngIf="category.image_preview"
            class="card-item-thumb"
            [src]="category.image_preview"
            alt=""
          />
        </div>
        <mat-card-content class="card-item-body">
          <p>{{ category.description_ar }}</p>
          <p>{{ category.description_en }}</p>
        </mat-card-content>
        <mat-card-actions class="card-item-actions">
          <button mat-button type="button" (click)="openEdit(category)">
            {{ 'COMMON.EDIT' | t }}
          </button>
          <button mat-button color="warn" type="button" (click)="remove(category)">
            {{ 'COMMON.DELETE' | t }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `
})
class CategoriesComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);
  private readonly language = inject(LanguageService);
  loading = false;
  categories: Category[] = [];

  ngOnInit(): void {
    this.fetch();
  }

  private fetch(): void {
    this.loading = true;
    this.http
      .get<Category[]>(`${API_BASE}/admin/categories.php`, { headers: authHeaders() })
      .subscribe({
        next: (data) => {
          this.categories = data.map((item) => ({
            ...item,
            image_preview: imageUrl(item.image),
            image_file: null
          }));
          storage.set('categories', this.categories.map((item) => ({
            id: item.id,
            name_ar: item.name_ar,
            name_en: item.name_en,
            description_ar: item.description_ar,
            description_en: item.description_en,
            image_data_url: item.image_preview || ''
          })));
          this.loading = false;
        },
        error: () => this.onError()
      });
  }

  openCreate(): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      data: { mode: 'create', category: this.emptyCategory() }
    });

    dialogRef.afterClosed().subscribe((result: Category | undefined) => {
      if (!result) {
        return;
      }
      this.saveCategory(result, 'create');
    });
  }

  openEdit(category: Category): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      data: { mode: 'edit', category }
    });

    dialogRef.afterClosed().subscribe((result: Category | undefined) => {
      if (!result) {
        return;
      }
      this.saveCategory({ ...result, id: category.id }, 'edit');
    });
  }

  remove(category: Category): void {
    const snack = this.snackBar.open(
      this.language.translate('COMMON.CONFIRM_DELETE'),
      this.language.translate('COMMON.DELETE_ACTION'),
      { duration: 6000 }
    );
    snack.onAction().subscribe(() => {
      this.loading = true;
      this.http
        .request('delete', `${API_BASE}/admin/categories.php`, {
          body: { id: category.id },
          headers: authHeaders()
        })
        .subscribe({
          next: () => {
            this.fetch();
            this.snackBar.open(this.language.translate('COMMON.DELETED'), undefined, {
              duration: 2000
            });
          },
          error: () => this.onError()
        });
    });
  }

  private saveCategory(category: Category, mode: 'create' | 'edit'): void {
    const hasFile = !!category.image_file;
    this.loading = true;

    if (mode === 'edit' && !hasFile) {
      this.http
        .put(
          `${API_BASE}/admin/categories.php`,
          {
            id: category.id,
            name_ar: category.name_ar,
            name_en: category.name_en,
            description_ar: category.description_ar,
            description_en: category.description_en
          },
          { headers: authHeaders() }
        )
        .subscribe({
          next: () => {
            this.fetch();
            this.snackBar.open(this.language.translate('COMMON.SAVED'), undefined, { duration: 2000 });
          },
          error: () => this.onError()
        });
      return;
    }

    const form = new FormData();
    if (mode === 'edit') {
      form.append('id', String(category.id));
      form.append('_method', 'PUT');
    }
    form.append('name_ar', category.name_ar);
    form.append('name_en', category.name_en);
    form.append('description_ar', category.description_ar);
    form.append('description_en', category.description_en);
    if (category.image_file) {
      form.append('image', category.image_file);
    }

    this.http
      .post(`${API_BASE}/admin/categories.php`, form, { headers: authHeaders() })
      .subscribe({
        next: () => {
          this.fetch();
          this.snackBar.open(this.language.translate('COMMON.SAVED'), undefined, { duration: 2000 });
        },
        error: () => this.onError()
      });
  }

  private onError(): void {
    this.loading = false;
    this.snackBar.open(this.language.translate('COMMON.ERROR'), undefined, { duration: 2000 });
  }

  private emptyCategory(): Category {
    return {
      id: 0,
      name_ar: '',
      name_en: '',
      description_ar: '',
      description_en: '',
      image: '',
      image_preview: '',
      image_file: null
    };
  }
}

interface ItemDialogData {
  mode: 'create' | 'edit';
  item: Item;
  categories: Category[];
}

@Component({
  selector: 'app-item-dialog',
  standalone: true,
  imports: [
    TranslatePipe,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    NgFor,
    NgIf
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'create' ? ('ITEMS.CREATE' | t) : ('ITEMS.EDIT' | t) }}
    </h2>
    <div mat-dialog-content>
      <form class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'ITEMS.NAME_AR' | t }}</mat-label>
          <input matInput name="name_ar" [(ngModel)]="item.name_ar" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'ITEMS.NAME_EN' | t }}</mat-label>
          <input matInput name="name_en" [(ngModel)]="item.name_en" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'ITEMS.PRICE' | t }}</mat-label>
          <input matInput type="number" name="price" [(ngModel)]="item.price" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'ITEMS.CATEGORY' | t }}</mat-label>
          <mat-select name="category" [(ngModel)]="item.category_id">
            <mat-option *ngFor="let category of data.categories" [value]="category.id">
              {{ category.name_ar }} / {{ category.name_en }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'ITEMS.DESC_AR' | t }}</mat-label>
          <input matInput name="desc_ar" [(ngModel)]="item.description_ar" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'ITEMS.DESC_EN' | t }}</mat-label>
          <input matInput name="desc_en" [(ngModel)]="item.description_en" />
        </mat-form-field>
        <div>
          <label>{{ 'ITEMS.IMAGE' | t }}</label>
          <input type="file" accept="image/*" (change)="onImageSelected($event)" />
        </div>
        <div class="image-preview" *ngIf="item.image_preview">
          <img [src]="item.image_preview" alt="Item preview" />
        </div>
      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button type="button" (click)="cancel()">{{ 'COMMON.CANCEL' | t }}</button>
      <button mat-raised-button color="primary" type="button" (click)="save()">
        {{ 'COMMON.SAVE' | t }}
      </button>
    </div>
  `
})
class ItemDialogComponent {
  readonly data = inject(MAT_DIALOG_DATA) as ItemDialogData;
  private readonly dialogRef = inject(MatDialogRef<ItemDialogComponent>);
  item: Item = { ...this.data.item };

  save(): void {
    this.dialogRef.close(this.item);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.item.image_file = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.item.image_preview = String(reader.result ?? '');
    };
    reader.readAsDataURL(file);
  }
}

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [
    TranslatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NgFor,
    NgIf
  ],
  template: `
    <div class="page-toolbar">
      <h2>{{ 'ITEMS.TITLE' | t }}</h2>
      <button mat-raised-button color="primary" type="button" (click)="openCreate()">
        <mat-icon>add</mat-icon>
        {{ 'COMMON.ADD' | t }}
      </button>
    </div>

    <div class="loading-center" *ngIf="loading">
      <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
    </div>

    <div class="card-grid" *ngIf="!loading">
      <mat-card class="card-item" *ngFor="let item of items">
        <div class="card-item-header">
          <div>
            <div class="card-item-title">{{ item.name_ar }} / {{ item.name_en }}</div>
            <div class="card-item-subtitle">{{ categoryLabel(item.category_id) }}</div>
          </div>
          <img *ngIf="item.image_preview" class="card-item-thumb" [src]="item.image_preview" alt="" />
        </div>
        <mat-card-content class="card-item-body">
          <p>{{ item.description_ar }}</p>
          <p>{{ item.description_en }}</p>
          <div class="card-item-meta">
            <span>{{ 'ITEMS.PRICE' | t }}: {{ item.price ?? '-' }}</span>
            <span>{{ 'ITEMS.CATEGORY' | t }}: {{ categoryLabel(item.category_id) }}</span>
          </div>
        </mat-card-content>
        <mat-card-actions class="card-item-actions">
          <button mat-button type="button" (click)="openEdit(item)">
            {{ 'COMMON.EDIT' | t }}
          </button>
          <button mat-button color="warn" type="button" (click)="remove(item)">
            {{ 'COMMON.DELETE' | t }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `
})
class ItemsComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);
  private readonly language = inject(LanguageService);
  loading = false;
  items: Item[] = [];
  categories: Category[] = [];

  ngOnInit(): void {
    this.fetchCategories();
    this.fetchItems();
  }

  private fetchCategories(): void {
    this.http
      .get<Category[]>(`${API_BASE}/admin/categories.php`, { headers: authHeaders() })
      .subscribe({
        next: (data) => {
          this.categories = data.map((item) => ({
            ...item,
            image_preview: imageUrl(item.image),
            image_file: null
          }));
        },
        error: () => {
          this.snackBar.open(this.language.translate('COMMON.ERROR'), undefined, { duration: 2000 });
        }
      });
  }

  private fetchItems(): void {
    this.loading = true;
    this.http
      .get<Item[]>(`${API_BASE}/admin/items.php`, { headers: authHeaders() })
      .subscribe({
        next: (data) => {
          this.items = data.map((item) => ({
            ...item,
            image_preview: imageUrl(item.image),
            image_file: null
          }));
          storage.set('items', this.items.map((item) => ({
            id: item.id,
            category_id: item.category_id,
            name_ar: item.name_ar,
            name_en: item.name_en,
            description_ar: item.description_ar,
            description_en: item.description_en,
            price: item.price,
            image_data_url: item.image_preview || ''
          })));
          this.loading = false;
        },
        error: () => this.onError()
      });
  }

  openCreate(): void {
    const dialogRef = this.dialog.open(ItemDialogComponent, {
      data: { mode: 'create', item: this.emptyItem(), categories: this.categories }
    });

    dialogRef.afterClosed().subscribe((result: Item | undefined) => {
      if (!result) {
        return;
      }
      this.saveItem(result, 'create');
    });
  }

  openEdit(item: Item): void {
    const dialogRef = this.dialog.open(ItemDialogComponent, {
      data: { mode: 'edit', item, categories: this.categories }
    });

    dialogRef.afterClosed().subscribe((result: Item | undefined) => {
      if (!result) {
        return;
      }
      this.saveItem({ ...result, id: item.id }, 'edit');
    });
  }

  remove(item: Item): void {
    const snack = this.snackBar.open(
      this.language.translate('COMMON.CONFIRM_DELETE'),
      this.language.translate('COMMON.DELETE_ACTION'),
      { duration: 6000 }
    );
    snack.onAction().subscribe(() => {
      this.loading = true;
      this.http
        .request('delete', `${API_BASE}/admin/items.php`, {
          body: { id: item.id },
          headers: authHeaders()
        })
        .subscribe({
          next: () => {
            this.fetchItems();
            this.snackBar.open(this.language.translate('COMMON.DELETED'), undefined, {
              duration: 2000
            });
          },
          error: () => this.onError()
        });
    });
  }

  categoryLabel(categoryId: number | null): string {
    if (!categoryId) {
      return '-';
    }
    const category = this.categories.find((item) => item.id === categoryId);
    return category ? `${category.name_ar} / ${category.name_en}` : '-';
  }

  private saveItem(item: Item, mode: 'create' | 'edit'): void {
    const hasFile = !!item.image_file;
    this.loading = true;

    if (mode === 'edit' && !hasFile) {
      this.http
        .put(
          `${API_BASE}/admin/items.php`,
          {
            id: item.id,
            name_ar: item.name_ar,
            name_en: item.name_en,
            price: item.price,
            description_ar: item.description_ar,
            description_en: item.description_en,
            category_id: item.category_id
          },
          { headers: authHeaders() }
        )
        .subscribe({
          next: () => {
            this.fetchItems();
            this.snackBar.open(this.language.translate('COMMON.SAVED'), undefined, { duration: 2000 });
          },
          error: () => this.onError()
        });
      return;
    }

    const form = new FormData();
    if (mode === 'edit') {
      form.append('id', String(item.id));
      form.append('_method', 'PUT');
    }
    form.append('name_ar', item.name_ar);
    form.append('name_en', item.name_en);
    form.append('price', item.price ? String(item.price) : '0');
    form.append('description_ar', item.description_ar);
    form.append('description_en', item.description_en);
    form.append('category_id', item.category_id ? String(item.category_id) : '');
    if (item.image_file) {
      form.append('image', item.image_file);
    }

    this.http
      .post(`${API_BASE}/admin/items.php`, form, { headers: authHeaders() })
      .subscribe({
        next: () => {
          this.fetchItems();
          this.snackBar.open(this.language.translate('COMMON.SAVED'), undefined, { duration: 2000 });
        },
        error: () => this.onError()
      });
  }

  private onError(): void {
    this.loading = false;
    this.snackBar.open(this.language.translate('COMMON.ERROR'), undefined, { duration: 2000 });
  }

  private emptyItem(): Item {
    return {
      id: 0,
      category_id: null,
      name_ar: '',
      name_en: '',
      description_ar: '',
      description_en: '',
      price: null,
      image: '',
      image_preview: '',
      image_file: null
    };
  }
}

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  ...authRoutes,
  {
    path: 'admin',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'settings' },
      { path: 'settings', component: RestaurantSettingsComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'items', component: ItemsComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
