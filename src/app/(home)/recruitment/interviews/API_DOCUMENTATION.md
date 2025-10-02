# Interview API Documentation

## Overview

This document describes the Interview API endpoints for managing interview records in the recruitment system.

## Base URL

```
/interview
```

## Endpoints

### 1. Create Interview

**POST** `/interview`

Creates a new interview record.

#### Request Body

```json
{
   "candidate_id": 123,
   "job_id": 456,
   "interviewer_ids": [1, 2, 3],
   "scheduled_at": "2024-01-15T10:00:00Z",
   "duration_minutes": 60,
   "meeting_link": "https://meet.google.com/abc-defg-hij",
   "location": "Conference Room A",
   "status": "scheduled"
}
```

#### Response

```json
{
   "interview_id": 1,
   "candidate_id": 123,
   "job_id": 456,
   "interviewer_ids": [1, 2, 3],
   "scores": null,
   "comments": null,
   "scheduled_at": "2024-01-15T10:00:00Z",
   "duration_minutes": 60,
   "meeting_link": "https://meet.google.com/abc-defg-hij",
   "location": "Conference Room A",
   "status": "scheduled",
   "created_at": "2024-01-10T08:00:00Z",
   "updated_at": "2024-01-10T08:00:00Z",
   "deleted_at": null
}
```

---

### 2. Update Interview

**PUT** `/interview/:id`

Updates an existing interview record.

#### Path Parameters

- `id` (number): Interview ID

#### Request Body

```json
{
   "scheduled_at": "2024-01-16T14:00:00Z",
   "duration_minutes": 90,
   "meeting_link": "https://meet.google.com/xyz-1234-abc",
   "location": "Conference Room B",
   "status": "in_progress",
   "scores": [8, 7, 9],
   "comments": [
      "Good technical skills",
      "Needs improvement in communication",
      "Strong problem-solving ability"
   ]
}
```

#### Response

```json
{
   "interview_id": 1,
   "candidate_id": 123,
   "job_id": 456,
   "interviewer_ids": [1, 2, 3],
   "scores": [8, 7, 9],
   "comments": [
      "Good technical skills",
      "Needs improvement in communication",
      "Strong problem-solving ability"
   ],
   "scheduled_at": "2024-01-16T14:00:00Z",
   "duration_minutes": 90,
   "meeting_link": "https://meet.google.com/xyz-1234-abc",
   "location": "Conference Room B",
   "status": "in_progress",
   "created_at": "2024-01-10T08:00:00Z",
   "updated_at": "2024-01-16T14:00:00Z",
   "deleted_at": null
}
```

---

### 3. Soft Delete Interview

**DELETE** `/interview/:id`

Soft deletes an interview record (sets deleted_at timestamp).

#### Path Parameters

- `id` (number): Interview ID

#### Response

```json
{
   "message": "Interview deleted successfully"
}
```

---

### 4. Get Interview by ID

**GET** `/interview/:id`

Retrieves a specific interview by its ID.

#### Path Parameters

- `id` (number): Interview ID

#### Response

```json
{
   "interview_id": 1,
   "candidate_id": 123,
   "job_id": 456,
   "interviewer_ids": [1, 2, 3],
   "scores": [8, 7, 9],
   "comments": ["Good technical skills", "Needs improvement in communication"],
   "scheduled_at": "2024-01-15T10:00:00Z",
   "duration_minutes": 60,
   "meeting_link": "https://meet.google.com/abc-defg-hij",
   "location": "Conference Room A",
   "status": "completed",
   "created_at": "2024-01-10T08:00:00Z",
   "updated_at": "2024-01-15T11:00:00Z",
   "deleted_at": null
}
```

---

### 5. Get Interviews by Candidate ID

**GET** `/interview/candidate/:candidateId`

Retrieves all interviews for a specific candidate.

#### Path Parameters

- `candidateId` (number): Candidate ID

#### Query Parameters

- `sortBy` (optional): Sort field (`scheduled_at` or `score`)

#### Example Request

```
GET /interview/candidate/123?sortBy=score
```

#### Response

```json
[
   {
      "interview_id": 1,
      "candidate_id": 123,
      "job_id": 456,
      "interviewer_ids": [1, 2, 3],
      "scores": [8, 7, 9],
      "comments": ["Good technical skills"],
      "scheduled_at": "2024-01-15T10:00:00Z",
      "duration_minutes": 60,
      "meeting_link": "https://meet.google.com/abc-defg-hij",
      "location": "Conference Room A",
      "status": "completed",
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-01-15T11:00:00Z",
      "deleted_at": null
   },
   {
      "interview_id": 2,
      "candidate_id": 123,
      "job_id": 789,
      "interviewer_ids": [2, 4],
      "scores": [6, 5],
      "comments": ["Average performance"],
      "scheduled_at": "2024-01-20T14:00:00Z",
      "duration_minutes": 45,
      "meeting_link": "https://meet.google.com/def-5678-ghi",
      "location": "Conference Room B",
      "status": "completed",
      "created_at": "2024-01-12T09:00:00Z",
      "updated_at": "2024-01-20T15:00:00Z",
      "deleted_at": null
   }
]
```

---

### 6. Get Interviews by Job ID

**GET** `/interview/job/:jobId`

Retrieves all interviews for a specific job.

#### Path Parameters

- `jobId` (number): Job ID

#### Query Parameters

- `sortBy` (optional): Sort field (`scheduled_at` or `score`)

#### Example Request

```
GET /interview/job/456?sortBy=scheduled_at
```

#### Response

```json
[
   {
      "interview_id": 1,
      "candidate_id": 123,
      "job_id": 456,
      "interviewer_ids": [1, 2, 3],
      "scores": null,
      "comments": null,
      "scheduled_at": "2024-01-15T10:00:00Z",
      "duration_minutes": 60,
      "meeting_link": "https://meet.google.com/abc-defg-hij",
      "location": "Conference Room A",
      "status": "scheduled",
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-01-10T08:00:00Z",
      "deleted_at": null
   },
   {
      "interview_id": 3,
      "candidate_id": 124,
      "job_id": 456,
      "interviewer_ids": [1, 3],
      "scores": null,
      "comments": null,
      "scheduled_at": "2024-01-18T16:00:00Z",
      "duration_minutes": 45,
      "meeting_link": "https://meet.google.com/ghi-9012-jkl",
      "location": "Conference Room C",
      "status": "scheduled",
      "created_at": "2024-01-14T10:00:00Z",
      "updated_at": "2024-01-14T10:00:00Z",
      "deleted_at": null
   }
]
```

---

### 7. Get All Interviews Sorted by Scheduled At

**GET** `/interview/all/scheduled`

Retrieves all interviews sorted by scheduled_at in ascending order.

#### Response

```json
[
   {
      "interview_id": 1,
      "candidate_id": 123,
      "job_id": 456,
      "interviewer_ids": [1, 2, 3],
      "scores": null,
      "comments": null,
      "scheduled_at": "2024-01-15T10:00:00Z",
      "duration_minutes": 60,
      "meeting_link": "https://meet.google.com/abc-defg-hij",
      "location": "Conference Room A",
      "status": "scheduled",
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-01-10T08:00:00Z",
      "deleted_at": null
   },
   {
      "interview_id": 3,
      "candidate_id": 124,
      "job_id": 456,
      "interviewer_ids": [1, 3],
      "scores": null,
      "comments": null,
      "scheduled_at": "2024-01-18T16:00:00Z",
      "duration_minutes": 45,
      "meeting_link": "https://meet.google.com/ghi-9012-jkl",
      "location": "Conference Room C",
      "status": "scheduled",
      "created_at": "2024-01-14T10:00:00Z",
      "updated_at": "2024-01-14T10:00:00Z",
      "deleted_at": null
   }
]
```

---

### 8. Get Interviews by Status

**GET** `/interview/status/:status`

Retrieves all interviews with a specific status.

#### Path Parameters

- `status` (string): Interview status

#### Example Request

```
GET /interview/status/scheduled
```

#### Response

```json
[
   {
      "interview_id": 1,
      "candidate_id": 123,
      "job_id": 456,
      "interviewer_ids": [1, 2, 3],
      "scores": null,
      "comments": null,
      "scheduled_at": "2024-01-15T10:00:00Z",
      "duration_minutes": 60,
      "meeting_link": "https://meet.google.com/abc-defg-hij",
      "location": "Conference Room A",
      "status": "scheduled",
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-01-10T08:00:00Z",
      "deleted_at": null
   },
   {
      "interview_id": 3,
      "candidate_id": 124,
      "job_id": 456,
      "interviewer_ids": [1, 3],
      "scores": null,
      "comments": null,
      "scheduled_at": "2024-01-18T16:00:00Z",
      "duration_minutes": 45,
      "meeting_link": "https://meet.google.com/ghi-9012-jkl",
      "location": "Conference Room C",
      "status": "scheduled",
      "created_at": "2024-01-14T10:00:00Z",
      "updated_at": "2024-01-14T10:00:00Z",
      "deleted_at": null
   }
]
```

---

### 9. Filter Interviews with Pagination

**GET** `/interview`

Retrieves interviews with filtering and pagination options.

#### Query Parameters

| Parameter      | Type   | Description            | Example                 |
| -------------- | ------ | ---------------------- | ----------------------- |
| `id`           | number | Filter by interview ID | `?id=1`                 |
| `candidate_id` | number | Filter by candidate ID | `?candidate_id=123`     |
| `job_id`       | number | Filter by job ID       | `?job_id=456`           |
| `status`       | string | Filter by status       | `?status=scheduled`     |
| `sort_by`      | enum   | Sort field             | `?sort_by=scheduled_at` |
| `sort_order`   | enum   | Sort order             | `?sort_order=ASC`       |
| `page`         | number | Page number            | `?page=1`               |
| `limit`        | number | Items per page         | `?limit=10`             |

#### Example Request

```
GET /interview?id=1&candidate_id=123&job_id=456&status=scheduled&sort_by=scheduled_at&sort_order=ASC&page=1&limit=10
```

#### Response

```json
{
   "data": [
      {
         "interview_id": 1,
         "candidate_id": 123,
         "job_id": 456,
         "interviewer_ids": [1, 2, 3],
         "scores": null,
         "comments": null,
         "scheduled_at": "2024-01-15T10:00:00Z",
         "duration_minutes": 60,
         "meeting_link": "https://meet.google.com/abc-defg-hij",
         "location": "Conference Room A",
         "status": "scheduled",
         "created_at": "2024-01-10T08:00:00Z",
         "updated_at": "2024-01-10T08:00:00Z",
         "deleted_at": null
      }
   ],
   "total": 1
}
```

---

## Data Models

### Interview Entity

```typescript
{
  interview_id: number;
  candidate_id: number;
  job_id: number;
  interviewer_ids: number[];
  scores: number[] | null;
  comments: string[] | null;
  scheduled_at: Date;
  duration_minutes: number;
  meeting_link: string;
  location: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
```

### Create Interview DTO

```typescript
{
  candidate_id: number;
  job_id: number;
  interviewer_ids: number[];
  scheduled_at: string; // ISO 8601 date string
  duration_minutes?: number; // Optional, default: 30
  meeting_link: string;
  location?: string; // Optional
  status?: string; // Optional, default: 'scheduled'
}
```

### Update Interview DTO

```typescript
{
  candidate_id?: number;
  job_id?: number;
  interviewer_ids?: number[];
  scheduled_at?: string; // ISO 8601 date string
  duration_minutes?: number;
  meeting_link?: string;
  location?: string;
  status?: string;
  scores?: number[];
  comments?: string[];
}
```

---

## Enums

### Interview Status

- `scheduled` - Interview has been scheduled
- `in_progress` - Interview is currently taking place
- `completed` - Interview has been completed
- `cancelled` - Interview has been cancelled

### Sort Fields

- `scheduled_at` - Sort by scheduled date and time
- `score` - Sort by interview scores
- `created_at` - Sort by creation date

### Sort Order

- `ASC` - Ascending order
- `DESC` - Descending order

---

## Error Responses

### 404 Not Found

```json
{
   "statusCode": 404,
   "message": "Interview with ID 999 not found",
   "error": "Not Found"
}
```

### 400 Bad Request

```json
{
   "statusCode": 400,
   "message": [
      "candidate_id must be a number",
      "scheduled_at must be a valid ISO 8601 date string"
   ],
   "error": "Bad Request"
}
```

### 500 Internal Server Error

```json
{
   "statusCode": 500,
   "message": "Internal server error",
   "error": "Internal Server Error"
}
```

---

## Validation Rules

### Create Interview

- `candidate_id`: Required, must be a number
- `job_id`: Required, must be a number
- `interviewer_ids`: Required, must be an array of numbers
- `scheduled_at`: Required, must be a valid ISO 8601 date string
- `duration_minutes`: Optional, must be between 15 and 480 minutes
- `meeting_link`: Required, must be a string
- `location`: Optional, must be a string
- `status`: Optional, must be a string

### Update Interview

- All fields are optional
- If provided, must follow the same validation rules as create

---

## Examples

### Create a new interview

```bash
curl -X POST http://localhost:3000/interview \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_id": 123,
    "job_id": 456,
    "interviewer_ids": [1, 2, 3],
    "scheduled_at": "2024-01-15T10:00:00Z",
    "duration_minutes": 60,
    "meeting_link": "https://meet.google.com/abc-defg-hij",
    "location": "Conference Room A",
    "status": "scheduled"
  }'
```

### Update an interview

```bash
curl -X PUT http://localhost:3000/interview/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "scores": [8, 7, 9],
    "comments": ["Good technical skills", "Needs improvement in communication"]
  }'
```

### Get interviews by candidate

```bash
curl -X GET "http://localhost:3000/interview/candidate/123?sortBy=score"
```

### Filter interviews

```bash
curl -X GET "http://localhost:3000/interview?status=scheduled&sort_by=scheduled_at&sort_order=ASC&page=1&limit=10"
```
