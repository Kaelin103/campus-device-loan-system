# Campus Device Loan System

A cloud-native campus device loan system built with Azure Functions, React, and GitHub Actions CI/CD.

## Overview
This project provides a web-based platform for managing the borrowing and returning of campus devices.
It follows a microservice architecture with independent backend services and a modern frontend.

## Architecture
- Frontend: React + Vite
- Backend: Azure Functions (Loan Service, Device Service)
- Database: Azure Cosmos DB
- Authentication: Auth0 (JWT, RBAC)
- CI/CD: GitHub Actions

## CI/CD
A GitHub Actions pipeline is used to automatically validate backend services on each push.
Each backend service is tested and built independently.
If any test fails, deployment is automatically blocked.

## Project Status
- Backend CI implemented and verified
- Intentional CI failure tested and validated
- All current pipelines passing successfully
