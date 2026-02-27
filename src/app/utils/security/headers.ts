import { HttpHeaders } from '@angular/common/http';

export var contentHeaders = new HttpHeaders();
contentHeaders = contentHeaders.append('Accept', 'application/json');
contentHeaders = contentHeaders.append('Content-Type', 'application/json');

export function createAuthorizationHeader(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
        'Accept': 'application/json',
        'Authorization': token ? token : ''
    });
}

export function createAuthorizationHeaderForm(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
        'Accept': 'application/json',
        'Authorization': token ? token : ''
    });
}

export function resetAuthorization() {
    // Optional: Implement if needed for clearing cache
}
