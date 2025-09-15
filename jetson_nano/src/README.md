### Steps to setup 

## 1. Installing uv => 
        On Linux - $ curl -LsSf https://astral.sh/uv/install.sh | sh
        
        On Windows - $ powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
        
        However, pip can also be used - $pip install uv

## 2. Create virtual env => 
        $ uv venv

## 3. Install dependencies from lockfile =>
        $ uv sync

## 4. Activate environment => 
        $ source .venv/bin/activate   # Linux/macOS     
        $ .\.venv\Scripts\activate    # Windows
 
## 5. Run the app =>
        $ uv run fastapi dev


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
