import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 5,
    duration: '30s',
};

export default function () {
    const res = http.get('http://localhost:5000/api/events');

    check(res, {
        'status is 200': (r) => r.status === 200,
        'events is an array': (r) => Array.isArray(r.json('events')),
    });

    sleep(1);
}