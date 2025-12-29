import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
declare var $: any;

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  public user: any = {
    correo: '',
    contrasena: ''
  };
  form: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const { correo, contrasena } = this.form.value;

    this.auth.login(correo, contrasena).subscribe({
      next: () => {
        const home = this.auth.getDefaultRoute();
        this.router.navigate([home]);
      },
      error: () => {
        this.errorMessage = 'Credenciales incorrectas';
      }
    });
  }

  login() {
    if (!this.user.correo) {
      this.mostrarNotificacion('Debe ingresar el correo electrónico');
    } else if (!this.user.contrasena) {
      this.mostrarNotificacion('Debe ingresar la contraseña');
    } else {
      this.auth.login(this.user.correo, this.user.contrasena).subscribe({
        next: (res) => {
          if (res?.token) {
            const home = this.auth.getDefaultRoute();
            this.router.navigate([home]);
          } else {
            this.mostrarNotificacion('Credenciales incorrectas');
          }
        },
        error: (err) => {
          console.error('Error en login:', err);
          this.mostrarNotificacion('Error al iniciar sesión');
        }
      });
    }
  }

  mostrarNotificacion(msg: string) {
    $.notify(msg, {
      type: 'danger',
      spacing: 10,
      timer: 2000,
      placement: { from: 'top', align: 'right' },
      delay: 1000,
      animate: { enter: 'animated bounce', exit: 'animated bounce' }
    });
  }
}
