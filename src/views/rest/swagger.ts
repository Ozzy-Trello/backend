export const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Task management RestAPI",
            version: "0.1.0",
            description:
                "This is a simple task management application made with Express and documented with Swagger",
        },
        servers: [
            {
                url: "http://localhost:8872",
            },
            {
                url: "http://103.150.100.46:8872",
            },
        ],
    },
    apis: ["./src/views/rest/docs.ts"],
};