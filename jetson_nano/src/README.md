# Project Setup Instructions

Follow these steps to set up the project environment and run the FastAPI app.

## Steps to Setup

### 1. Installing `uv`

- **On Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh

        
- **On Windows:**
```bash
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

However, pip can also be used -
```bash 
$ pip install uv

2. ** Create virtual env ** => 
```bash 
$ uv venv

3. ** Install dependencies from lockfile ** =>
```bash 
$ uv sync

4. ** Activate environment ** => 
      ** Linux/macOS **
```bash 
source .venv/bin/activate 

     ** Windows **
```bash 
.\.venv\Scripts\activate

 
5. ** Run the App **  => 
```bash 
uv run fastapi dev


## 📂 Project Structure

```text

 └─ src/
     ├─ .venv/          # Local virtual environment (ignored in Git)
     ├─ app/            # Application source code
     │   ├─ __init__.py
     │   └─ main.py     # FastAPI entrypoint
     ├─ pyproject.toml  # Project dependencies
     ├─ uv.lock         # Locked dependency versions
     └─ README.md       # Project setup instructions
