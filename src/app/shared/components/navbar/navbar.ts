import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, FormsModule],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private readonly auth = inject(AuthService);

  readonly searchQuery = signal('');
  readonly currentUser = this.auth.currentUser;

  readonly onSearch = output<string>();
  readonly onCreateInventory = output<void>();

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.onSearch.emit(value);
  }

  async logout(): Promise<void> {
    await this.auth.logout();
  }
}