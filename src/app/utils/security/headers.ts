import { HttpHeaders } from '@angular/common/http';

export var contentHeaders = new HttpHeaders();
contentHeaders = contentHeaders.append('Accept', 'application/json');
contentHeaders = contentHeaders.append('Content-Type', 'application/json');
export var id_token = localStorage.getItem('id_token') as never;

export function createAuthorizationHeader(): HttpHeaders {
    if (id_token == null)
        id_token = id_token = localStorage.getItem('id_token') as never;
    let headers = new HttpHeaders({
        'Accept': 'application/json',
        'Authorization': id_token
    });
    return headers;
}

export function createAuthorizationHeaderForm(): HttpHeaders {
    let headers = new HttpHeaders({
        'Accept': 'application/json',
        'Authorization': id_token
    });
    return headers;
}

export function resetAuthorization() {
    id_token as never;
}
