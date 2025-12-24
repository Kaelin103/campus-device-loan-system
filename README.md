# Campus Device Loan System

A cloud-native campus device loan system built with Azure Functions, React, and GitHub Actions CI/CD.

## Overview

This project provides a web-based platform for managing the borrowing and returning of campus devices.  
It follows a microservice-oriented architecture with independent backend services and a modern frontend.

## Architecture

- **Frontend**: React + Vite  
- **Backend**: Azure Functions (Device Service, Loan Service)  
- **Database**: Azure Cosmos DB  
- **Authentication**: Auth0 (JWT-based user identity)  
- **CI/CD**: GitHub Actions  

## CI/CD

GitHub Actions pipelines are used to automatically validate backend services on each push.  
Each backend service is tested and built independently.  
If any test fails, the deployment process is automatically blocked.  
Successful pipelines deploy backend services to Azure Functions.

## Project Status

- Backend CI implemented and verified  
- Intentional CI failure tested and validated  
- All current pipelines passing successfully  
