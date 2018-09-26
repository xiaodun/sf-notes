module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2017,
        "sourceType": "module"
    },
    "rules": {
        "no-constant-condition":["error",{
            "checkLoops":false
        }],
        "no-unreachable":"error"
    }
};