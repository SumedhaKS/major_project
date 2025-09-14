Steps to setup =>

1. Installing uv => 
        On Linux - $ sudo snap install astral-uv --classic
        
        On Windows - $ powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
        
        However, pip can also be used - $pip install uv

2. Create virtual env => 
        $ uv venv

3. Install dependencies from lockfile =>
        $ uv sync

4. Activate environment
        $ source .venv/bin/activate   # Linux/macOS
        $ .\.venv\Scripts\activate    # Windows
 
5. Run the app
        $ uv run fastapi dev


##File structure

└─ src/
├─ .venv/ # Local virtual environment (ignored in Git)
├─ app/ # Application source code
│ ├─ init.py
│ └─ main.py # FastAPI entrypoint
├─ pyproject.toml # Project dependencies
├─ uv.lock # Locked dependency versions
└─ README.md # Project setup instructions