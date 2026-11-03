# Child Panel API Documentation

## Authentication

All API requests require authentication using an API key. You can authenticate by passing the API key in one of the following ways:

1. **Authorization Header (Recommended)**: `Authorization: Bearer YOUR_API_KEY`
2. **X-API-Key Header**: `X-API-Key: YOUR_API_KEY`
3. **Query Parameter**: `?api_key=YOUR_API_KEY`

## Base URL

```
https://your-panel-domain.com/api
```

## API Keys

### Generate API Key (via Dashboard)
Navigate to your child panel dashboard > Settings > API Keys to generate and manage API keys.

### Scopes
- `read` - Read access to resources
- `write` - Write/create/update access
- `admin` - Full administrative access

## Endpoints

### Orders

#### Create Order
```http
POST /api/v1/orders
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "service_id": "uuid",
  "link": "https://example.com/your-content",
  "quantity": 100
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "status": "pending",
    "charge": 120.00,
    "currency": "KES"
  }
}
```

#### Get Order Status
```http
GET /api/v1/orders/{order_id}
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "service_id": "uuid",
    "link": "https://example.com/your-content",
    "quantity": 100,
    "status": "completed",
    "start_count": 1000,
    "remains": 0,
    "charge": 120.00
  }
}
```

#### List Orders
```http
GET /api/v1/orders?page=1&limit=50
Authorization: Bearer YOUR_API_KEY
```

### Services

#### List Services
```http
GET /api/v1/services
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "service_id": "uuid",
      "name": "Instagram Followers",
      "category": "Instagram",
      "price": 1.20,
      "min_quantity": 100,
      "max_quantity": 10000
    }
  ]
}
```

### Balance

#### Get Balance
```http
GET /api/v1/balance
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 1500.00,
    "currency": "KES"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 401 | Unauthorized - Invalid or missing API key |
| 403 | Forbidden - Insufficient scopes |
| 429 | Too Many Requests - Rate limit exceeded |
| 400 | Bad Request - Invalid parameters |
| 500 | Internal Server Error |

## Rate Limits

Default rate limit is 1000 requests per hour per API key. You can configure this when creating the API key.

## Examples

### cURL
```bash
curl -X GET https://your-panel.com/api/v1/balance \
  -H "Authorization: Bearer jzc_xxxxx_yyyyy"
```

### Python
```python
import requests

headers = {"Authorization": "Bearer YOUR_API_KEY"}
response = requests.get("https://your-panel.com/api/v1/balance", headers=headers)
print(response.json())
```

### JavaScript/Node.js
```javascript
const response = await fetch("https://your-panel.com/api/v1/balance", {
  headers: { "Authorization": "Bearer YOUR_API_KEY" }
});
const data = await response.json();
```

### PHP
```php
<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://your-panel.com/api/v1/balance");
curl_setopt($ch, CURLOPT_HTTPHEADER, array("Authorization: Bearer YOUR_API_KEY"));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
echo $response;
```

## Security Best Practices

1. Never share your API key in public repositories or client-side code
2. Rotate keys regularly
3. Use appropriate scopes (least privilege principle)
4. Set expiration dates for keys when possible
5. Revoke compromised keys immediately
