from fastapi import FastAPI, Request, status
from Api import UserApi, BlogApi
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins= {"http://localhost:5173" "localhost:5173"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    friendly_exception = []

    for error in exc.errors():
        where_is_it = " -> ".join(str(loc) for loc in error["loc"])
        what_is_it = error["msg"]

        friendly_exception.append({"field": where_is_it, "message": what_is_it})

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"validation_error": friendly_exception},
    )


app.include_router(UserApi.router, prefix="/api/v1/user", tags=["User"])
app.include_router(BlogApi.router, prefix="/api/v1/blog", tags=["Blogs"])
