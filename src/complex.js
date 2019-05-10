const SQRT2 = Math.sqrt(2);
const EPSILON = 0.0000001;

export default class Complex {
    /**
     *
     * @param {number} re
     * @param {number} im
     */
    constructor(re, im) {
        this.re = re;
        this.im = im;
    }

    /**
     *
     * @param {Complex} c
     * @returns {Complex}
     */
    add(c) {
        return new Complex(this.re + c.re,
                           this.im + c.im);
    }

    /**
     *
     * @param {Complex} c
     * @returns {Complex}
     */
    sub(c) {
        return new Complex(this.re - c.re,
                           this.im - c.im);
    }

    /**
     *
     * @param {Complex} c
     * @returns {Complex}
     */
    mult(c) {
        return new Complex((this.re * c.re) - (this.im * c.im),
                           (this.re * c.im) + (this.im * c.re));
    }

    /**
     *
     * @param {Complex} c
     * @returns {Complex}
     */
    div(c) {
        if (c.isInfinity()) {
            return Complex.ZERO;
        }
        const denom = (c.re * c.re) + (c.im * c.im);
        if (denom < EPSILON) {
            return new Complex(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        }

        return new Complex((this.re * c.re + this.im * c.im) / denom,
                           (this.im * c.re - this.re * c.im) / denom);
    }

    /**
     *
     * @param {Complex} c1
     * @param {Complex} c2
     * @returns {Complex}
     */
    static sum (c1, c2) {
        return c1.add(c2);
    }

    /**
     *
     * @param {Complex} c1
     * @param {Complex} c2
     * @returns {Complex}
     */
    static diff (c1, c2) {
        return c1.sub(c2);
    }

    /**
     *
     * @param {Complex} c1
     * @param {Complex} c2
     * @returns {Complex}
     */
    static prod (c1, c2) {
        return c1.mult(c2);
    }

    /**
     *
     * @param {Complex} c1
     * @param {Complex} c2
     * @returns {Complex}
     */
    static quot (c1, c2) {
        return c1.div(c2);
    }

    /**
     *
     * @param {number} k
     * @returns {Complex}
     */
    scale(k) {
        return new Complex(this.re * k, this.im * k);
    }

    /**
     *
     * @returns {number}
     */
    arg () {
        return Math.atan2(this.im, this.re);
    }

    /**
     *
     * @returns {Complex}
     */
    conjugate () {
        return new Complex(this.re, -this.im);
    }

    /**
     *
     * @param {Complex} c
     * @returns {Complex}
     */
    static conjugate (c) {
        return c.conjugate();
    }

    /**
     *
     * @returns {Complex}
     */
    normalize () {
        return this.scale(1 / this.abs());
    }

    /**
     *
     * @returns {number}
     */
    abs () {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }

    /**
     *
     * @param {Complex} c
     * @returns {number}
     */
    static abs (c) {
        return c.abs();
    }

    /**
     *
     * @returns {number}
     */
    absSq() {
        return this.re * this.re + this.im * this.im;
    }

    /**
     *
     * @param {Complex} c
     * @returns {number}
     */
    static absSq (c) {
        return c.absSq();
    }

    /**
     *
     * @param {Complex} c
     * @returns {boolean}
     */
    eq(c) {
        const re = this.re - c.re;
        const im = this.im - c.im;
        return (re * re + im * im) < EPSILON;
    }

    /**
     *
     * @param {Complex} c1
     * @param {Complex} c2
     * @returns {boolean}
     */
    static eq(c1, c2) {
        const re = c1.re - c2.re;
        const im = c1.im - c2.im;
        return (re * re + im * im) < EPSILON;
    }

    /**
     *
     * @param {Complex} c1
     * @param {Complex} c2
     * @returns {number}
     */
    static distance(c1, c2) {
        return c1.sub(c2).abs();
    }

    /**
     *
     * @returns {Complex}
     */
    sq () {
        return new Complex((this.re * this.re) - (this.im * this.im),
                           (this.re * this.im) + (this.im * this.re));
    }

    /**
     *
     * @param {Complex} c
     * @returns {Complex}
     */
    static sq(c) {
        return c.sq();
    }

    /**
     *
     * @returns {Complex}
     */
    sqrt () {
        if (this.im > 0) {
            return new Complex(Math.sqrt(this.re + Math.sqrt(this.re * this.re +
                                                             this.im * this.im)) / SQRT2,
                               Math.sqrt(-this.re + Math.sqrt(this.re * this.re +
                                                              this.im * this.im)) / SQRT2);
        } else if (this.im < 0) {
            return new Complex(Math.sqrt(this.re + Math.sqrt(this.re * this.re + this.im * this.im)) / SQRT2,
                               -Math.sqrt(-this.re + Math.sqrt(this.re * this.re + this.im * this.im)) / SQRT2);
        }

        if (this.re < 0) {
            return new Complex(0, Math.sqrt(Math.abs(this.re)));
        }

        return new Complex(Math.sqrt(this.re), 0);
    }

    /**
     *
     * @param {Complex} c
     * @returns {Complex}
     */
    static sqrt(c) {
        return c.sqrt();
    }

    /**
     *
     * @param {Complex} c1
     * @param {Complex} c2
     * @returns {number}
     */
    static dot(c1, c2) {
        return c1.re * c2.re + c1.im * c2.im;
    }

    /**
     *
     * @returns {boolean}
     */
    isInfinity() {
        return (this.re === Number.POSITIVE_INFINITY || this.im === Number.POSITIVE_INFINITY);
    }

    /**
     *
     * @returns {boolean}
     */
    isZero() {
        return (Math.abs(this.re) < EPSILON && Math.abs(this.im) < EPSILON);
    }

    /**
     *
     * @returns {boolean}
     */
    isReal () {
        return Math.abs(this.im) < EPSILON;
    }

    /**
     *
     * @returns {boolean}
     */
    isPureImaginary () {
        return Math.abs(this.re) < EPSILON;
    }

    /**
     *
     * @returns {boolean}
     */
    hasNaN () {
        return isNaN(this.re) || isNaN(this.im);
    }

    /**
     *
     * @returns {number[]}
     */
    get linearArray () {
        return [this.re, this.im];
    }

    /**
     *
     * @returns {Complex}
     */
    static get ZERO() {
        return new Complex(0, 0);
    }

    /**
     *
     * @returns {Complex}
     */
    static get ONE() {
        return new Complex(1, 0);
    }

    /**
     *
     * @returns {Complex}
     */
    static get I() {
        return new Complex(0, 1);
    }

    /**
     *
     * @returns {Complex}
     */
    static get MINUS_ONE() {
        return new Complex(-1, 0);
    }

    /**
     *
     * @returns {Complex}
     */
    static get INFINITY() {
        return new Complex(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    }
}
