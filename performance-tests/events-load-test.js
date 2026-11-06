
import http from 'k6/http';
import { check, sleep } from 'k6';

// Configure the load test
export const options = {
    vus: 5,
    duration: '30s',
};

export default function () {

    // Send GET request to EventOps
    const response = http.get('http://localhost:5000/');

    // Verify the response
    check(response, {
        'status is 200': (r) => r.status === 200,
        'correct API message': (r) =>
            r.json('message') === 'EventOps API is running',
    });

    // Wait for one second before next iteration
    sleep(1);
}
