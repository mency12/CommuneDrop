### Valuation Service

## Overview

The Valuation Service calculates delivery costs for the Commune Drop platform. It determines pricing based on distance, parcel size, weight, urgency, and other factors to provide accurate and fair pricing for both customers and carriers.

## Features

- Dynamic pricing based on multiple factors
- Distance-based calculations using mapping services
- Weight and dimension-based pricing tiers
- Time-of-day and demand-based surge pricing
- Special handling fees for fragile or hazardous items
- Promotional discounts and coupon integration
- Custom pricing rules for enterprise clients
- Historical pricing data for analytics

## Dependencies

- Location Service: For distance and route calculations
- Order Service: For order details and specifications
- External Mapping APIs: For distance and time estimates
- Analytics Service: For demand forecasting

## Technology Stack

- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB
- Caching: Redis for pricing rules and calculations
- Geospatial: Google Maps/Mapbox APIs
- Machine Learning: Optional for predictive pricing models

## Setup

### Prerequisites

- Node.js v16+
- MongoDB
- Redis
- Mapping API keys (Google Maps, Mapbox, etc.)

### Quick Start

1. Clone the repository

```shellscript
git clone https://github.com/commune-drop/valuation-service.git
cd valuation-service

```
