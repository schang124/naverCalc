class NumUtil{
    static addComma(n){
        const numStr = this.removeComma(n.toString());
        let parts = numStr.split(".");
        return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] || parts[1] === '' ? "." + parts[1] : "");
    }

    static removeComma(n){
        return n.toString().replace(/,/g, '');
    }
}

export default NumUtil