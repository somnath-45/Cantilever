from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from Apis import user_api, task_api


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cantilever-task-management.vercel.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(
    RequestValidationError
)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):
    friendly_exceptions = []

    for error in exc.errors():
        field = " -> ".join(
            str(loc)
            for loc in error["loc"]
        )

        friendly_exceptions.append(
            {
                "field": field,
                "message": error["msg"]
            }
        )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "Validation": friendly_exceptions
        }
    )


app.include_router(
    user_api.router,
    prefix="/api/v1/user",
    tags=["User"]
)

app.include_router(
    task_api.router,
    prefix="/api/v1/task",
    tags=["Task"]
)

