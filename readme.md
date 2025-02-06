# Requirement
- nodejs >=22

# Initial Installation
- `cp .env.example .env`
- `npm install`
- `npm run sequelize -- init`
- `npm run sequelize -- db:migrate`

# Development 
`npm run dev`

# Production
`npm run start`

# Migrate new changes
`npm run sequelize -- db:migrate`

# Notes
 To use `sequelize` cli you need to use with npm, like
 `npm run sequelize -- db:migrate` or `npm run sequelize -- --help` to see help