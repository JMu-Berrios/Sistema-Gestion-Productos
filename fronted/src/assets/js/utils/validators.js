const validators = {
    isEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    isRequired(value) {
        return value && value.trim() !== '';
    },

    isPasswordStrong(password) {
        // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return regex.test(password);
    },

    isNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    isPositiveNumber(value) {
        return this.isNumber(value) && parseFloat(value) > 0;
    },

    isInteger(value) {
        return this.isNumber(value) && Number.isInteger(parseFloat(value));
    },

    isPositiveInteger(value) {
        return this.isInteger(value) && parseInt(value) > 0;
    },

    validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return true;

        const inputs = form.querySelectorAll('input, select, textarea');
        let isValid = true;

        inputs.forEach(input => {
            if (input.hasAttribute('required')) {
                const value = input.value.trim();
                if (!this.isRequired(value)) {
                    isValid = false;
                    input.classList.add('is-invalid');
                } else {
                    input.classList.remove('is-invalid');
                }
            }

            if (input.type === 'email' && input.value) {
                if (!this.isEmail(input.value)) {
                    isValid = false;
                    input.classList.add('is-invalid');
                } else {
                    input.classList.remove('is-invalid');
                }
            }

            if (input.type === 'number' && input.value) {
                if (!this.isPositiveNumber(input.value)) {
                    isValid = false;
                    input.classList.add('is-invalid');
                } else {
                    input.classList.remove('is-invalid');
                }
            }
        });

        return isValid;
    }
};