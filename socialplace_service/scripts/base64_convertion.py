#!/usr/bin/env python3
""" Converts email and password to base64 encoded credentials for use with
    the /auth endpoint of the API. """
import sys
import base64

def convert_to_base64(email, password):
    credentials = f"{email}:{password}"
    base64_credentials = base64.b64encode(credentials.encode()).decode()
    return base64_credentials

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: ./base64conv.py <email> <password>")
        sys.exit(1)

    email = sys.argv[1]
    password = sys.argv[2]

    base64_credentials = convert_to_base64(email, password)
    print(f"Base64 Encoded Credentials: {base64_credentials}")
