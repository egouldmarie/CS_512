export default {
    entry: "./HW7.html",
    output: {
        // the page loads a `<script type="module">`, so emit ES modules to match
        module: true
    },
    module: {
        rules: [
            {
                test: /\.jpg/,
                type: "asset/resource"
            }
        ]
    }
}
