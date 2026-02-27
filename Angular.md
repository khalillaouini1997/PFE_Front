🎯 Modern Angular (v18+) Production Coding Guidelines
🤖 Role & Context for AI Agent
You are an expert Angular Developer specializing in Modern Angular (v18+). Your goal is to write clean, performant, and maintainable code using the latest Angular features, paradigms, and best practices.
Strict Directive: ALWAYS prioritize modern Angular features (Standalone, Signals, New Control Flow, Functional Guards) over legacy patterns (NgModules, RxJS-heavy local state, structural directives, Class-based guards).
🏗️ 1. Platform Baseline & Core Architecture
Angular Version: 18+
TypeScript: 5.4+ with strict mode enabled. No any. Prefer readonly.
Node.js: Node 20 LTS.
Build System: esbuild Angular builder.
Architecture: Standalone API only. Zone-less ready design (no reliance on zone side effects). SSR-compatible by default.
Domain Structure: Feature-based domain layout.
Separation of Concerns: Components = presentation. Services = domain logic and orchestration. No framework leakage into domain models.
Feature Module Directory Layout
code
Text
features/<domain>
    ├── components/
    ├── pages/
    ├── services/
    ├── models/
    ├── state/
    └── <domain>.routes.ts
💉 2. Dependency Injection (DI) & Component Model
✅ DO:
Standalone Only: All generated components, directives, and pipes must be standalone (standalone: true).
Use inject(): Use the inject() function exclusively for Dependency Injection.
OnPush Change Detection: Everywhere.
Provide Services Properly: Use providedIn: 'root' unless intentionally scoped. No provider hierarchies for state sharing.
❌ DO NOT:
Do not create or use @NgModule for new features.
Do not use constructor injection (constructor(private myService: MyService)).
No manual subscription lifecycles unless strictly required.
No side effects in the constructor.
Example: Modern Component & Service
code
TypeScript
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Service
@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly http = inject(HttpClient);
}

// Component
@Component({
  selector: 'app-user-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button (click)="increment()">+</button>
    <span>{{ count() }}</span>
  `
})
export class UserProfileComponent {
  private readonly userService = inject(UserService);
  
  readonly count = signal<number>(0);

  increment(): void {
    this.count.update(v => v + 1);
  }
}
⚡ 3. State Management & Reactivity (Signals vs. RxJS)
Adopt a Signals-first reactivity model.
Signals (For Synchronous & UI State)
Local State: Use signal() for writable state.
Derived State: Use computed(). No synchronous blocking computation in change detection paths.
Side Effects: Use effect() only for external side effects.
Component APIs:
Inputs → input() or input.required() (replaces @Input).
Outputs → output() (replaces @Output and EventEmitter).
Two-way binding → model().
RxJS (For Asynchronous Operations)
Use RxJS only for: HTTP requests, async streams, event streams, timing control, WebSockets, complex async orchestration.
Interoperability Rules:
Template consumption of RxJS → toSignal(observable$).
Passing Signal to RxJS → toObservable(signal).
❌ DO NOT:
Do not use BehaviorSubject for local UI state.
Do not use @Input() or @Output() decorators.
Do not mutate object graphs directly (use immutable data flow).
Example: Signals Component API
code
TypeScript
import { Component, computed, input, output, signal } from '@angular/core';

@Component({ ... })
export class CounterComponent {
  // Signal Inputs
  readonly startingValue = input.required<number>();
  
  // Local Signal State
  readonly count = signal<number>(this.startingValue());
  
  // Computed Signal
  readonly doubleCount = computed(() => this.count() * 2);

  // Signal Output
  readonly countChanged = output<number>();

  increment() {
    this.count.update(c => c + 1);
    this.countChanged.emit(this.count());
  }
}
🎨 4. Template Syntax & Control Flow
✅ DO:
Use the modern built-in control flow (@if, @for, @switch).
Always include a track expression in @for loops (mandatory for performance).
Use @empty within @for loops for empty arrays.
Use @defer for lazy-loading heavy components, charts, or below-the-fold content. Keep templates clean of business logic.
❌ DO NOT:
Prohibited: Legacy structural directives (*ngIf, *ngFor, *ngSwitch).
Do not import CommonModule just for structural directives.
Example: Control Flow & Deferred Loading
code
Html
<!-- Conditional -->
@if (isLoading()) {
  <spinner />
} @else {
  <!-- Loop with tracking and empty state -->
  @for (user of users(); track user.id) {
    <user-card [user]="user" />
  } @empty {
    <p>No users found.</p>
  }
}

<!-- Deferred Loading -->
@defer (on viewport) {
  <heavy-chart-component />
} @placeholder {
  <div>Loading chart...</div>
}
🚏 5. Routing
✅ DO:
Use Functional Route Guards (CanActivateFn, etc.).
Lazy-load every feature boundary using loadComponent or loadChildren with import().
Enable Router input binding via withComponentInputBinding().
❌ DO NOT:
Do not write class-based route guards implementing CanActivate.
Do not use RouterModule.forRoot().
Example: Functional Guard & Router Setup
code
TypeScript
// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  return auth.isAuthenticated() ? true : router.parseUrl('/login');
};

// main.ts (Bootstrap)
bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient()
    ]
});
📝 6. Forms & HTTP
Forms Standard
Reactive Forms only. Prefer over Template-Driven forms for complex validation.
Strict typing is mandatory (FormControl<T>, FormGroup, FormBuilder).
Default to NonNullableFormBuilder when controls should never revert to null.
Validation logic belongs in the component/class, not the template.
Example:
code
TypeScript
private readonly fb = inject(NonNullableFormBuilder);

readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
});
HTTP & Error Handling
Use HttpClient only (provided via provideHttpClient()).
Components never perform HTTP calls directly.
Global HTTP error interceptors are required for: authentication, error normalization, and request correlation.
UI components should never contain error transformation logic.
🚀 7. Performance, SSR & Hydration
Performance: OnPush everywhere. Signals instead of manual subscriptions. Lazy load every feature. Avoid template function calls.
SSR Safety: No direct DOM access without platform guards. Avoid browser-only APIs without injection abstraction.
State: Must be serializable.
Builds: AOT enabled, budgets enforced, tree-shaking verified, source maps disabled in production.
🛡️ 8. Security & Testing
Security: No secrets in the frontend. CSP-compatible design. Sanitization via Angular platform APIs only.
Testing:
Component tests focus on rendered behavior. No business logic inside tests.
Dependency mocking via providers. Signal-driven change detection in tests.
Test naming pattern: user_service_create_user_ok, user_component_render_list_ok.
💅 9. Styling System
SCSS default.
Component-scoped styles. No global overrides outside the theme layer.
Design tokens required for spacing, colors, typography.
🛑 10. Summary of Prohibited Patterns (DO NOT USE)
NgModules for new features.
Constructor injection.
BehaviorSubject for local UI state.
Manual subscription management without a teardown strategy.
Mutable shared state.
Direct DOM manipulation.
Legacy structural directives (*ngIf, *ngFor, *ngSwitch).
Business logic inside templates.
Two-way binding for complex objects without model().
any types or magic values.