# toc
Javascript-based table of content for web pages

## Usage example
```
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TOC usage example</title>
    <link rel="stylesheet" href="../toc.css">
</head>
<body>
    <nav id="toc"></nav>
    <main>
        <h1>Chapter 1</h1>
        <h2>Section 1.A</h2>
        <h2>Section 1.B</h2>
        <h3>Subsection 1.B.i</h3>
        <h2>Section 1.C</h2>
        <h1>Chapter 2</h1>
        <h2>Section 2.A</h2>
        <h3>Subsection 2.A.i</h3>
        <h3>Subsection 2.A.ii</h3>
        <h3>Subsection 2.A.iii</h3>
        <h2>Section 2.B</h2>

        <script type="module">
            import add_toc from "./toc.js";
            add_toc("main", "toc");
        </script>
    </main>
</body>
```
