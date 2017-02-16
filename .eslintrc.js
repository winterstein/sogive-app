module.exports = {
    "extends": "airbnb",
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "rules": {
		/* off because we dont agree with AirBnB's settings */
    	"indent": ["warn", "tab"],
		"no-tabs": "off",
		"no-plusplus": "off",
		"no-continue": "off",
		"space-in-parens": "off",
		"space-unary-ops": "off",		
		"func-names": "off",
		"comma-dangle": "off",
		"no-useless-return": "off",
		"quote-props": "warn",
		"max-len": "warn",
		"max-nested-callbacks": ["warn", 4],
		"max-depth": ["warn", 4],
		"no-unused-vars": "warn",
		"spaced-comment": "off",
		"prefer-template": "off",		
		/* off because the warnings are more noise than signal i.e. we might switch them on sometime*/				
		"import/extensions": "warn",
		"no-extra-bind": "warn",
		"space-infix-ops": "off",
		"space-comment": "off",
		"object-property-newline": "off",
		"object-shorthand": "off",
		"space-before-function-paren": "off",
		"comma-spacing": "off",
		"quotes": "off",
		"object-curly-spacing": "off",
		"prefer-const": "off",		
		"prefer-arrow-callback": "off",
		"key-spacing": "off",
		"no-trailing-spaces": "off",		
    }
};