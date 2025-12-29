import { NgModule } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { AuthRoutingModule } from './auth-routing.module'; 
import { Login } from './login/login'; 

@NgModule({ 
    declarations: [Login], 
    
    imports: [
        CommonModule, 
        ReactiveFormsModule, 
        FormsModule, 
        AuthRoutingModule
    ] 
}) 

export class AuthModule { }