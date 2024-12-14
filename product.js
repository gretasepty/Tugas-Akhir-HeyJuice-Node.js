const express = require('express');
const multer = require("multer");
const cors = require("cors");
const bodyParser = require('body-parser');
const path = require("path")
const koneksi = require('./config/database');
const { error } = require('console');
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("uploads"))

//Konfigurasi penyimpanan file foto dengan multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    },
});
const upload = multer({ storage: storage });


//Menambahkan produk dengan reactjs
app.post("/add-product", upload.single("gambar"), (req, res) => {
    const { idCategory, namaProduk, harga, stock, size, deskripsi } = req.body;
    const gambar = req.file ? req.file.filename : null;

    const sql = "INSERT INTO product (idCategory, namaProduk, harga, stock, size, deskripsi, gambar) VALUES (?, ?, ?, ?, ?, ?, ?)";
    koneksi.query(sql, [idCategory, namaProduk, harga, stock, size, deskripsi, gambar], (err, result) => {
        if(err){
            return res.status(500).json({ error: "Eror memasukkan data"}); 
        }
        res.status(201).json({ message: "Sukses memasukkan data"});
    });
});

//Menampilkan Katalog integrasi dengan react
app.get("/product", (req, res) => {
    const sql = "SELECT namaProduk, harga, gambar FROM product";
    koneksi.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Error! Tidak bisa menampilkan katalog"});
        }
        res.json(result);
    });
});



//Detail produk berdasarkan id integrasi dengan react.js
app.get('/detail/:idProduk', (req, res) => {
    const idProduk = parseInt(req.params.idProduk, 10);
    
    if (isNaN(idProduk)) {
        console.error('ID Produk tidak valid:', req.params.idProduk);
        return res.status(400).json({ message: 'idProduk tidak valid' });
    }

    const querySql = `
        SELECT product.namaProduk AS Produk, 
               product.harga AS Harga, 
               category.name AS Kategori, 
               product.size AS Ukuran, 
               product.deskripsi AS Deskripsi, 
               product.gambar AS Gambar 
        FROM product
        INNER JOIN category
        ON product.idCategory = category.idCategory 
        WHERE product.idProduk = ?`;

    console.log(`Mencoba mengambil detail produk dengan ID: ${idProduk}`);

    koneksi.query(querySql, [idProduk], (err, rows, field) => {
        if (err) {
            console.error("Query Error Detail Produk:", err);
            return res.status(500).json({ 
                message: 'Ada kesalahan saat mengambil detail produk', 
                error: err.message 
            });
        }

        // Log jumlah rows yang ditemukan
        console.log(`Jumlah produk ditemukan: ${rows.length}`);

        if (rows.length === 0) {
            console.warn(`Tidak ada produk ditemukan dengan ID: ${idProduk}`);
            return res.status(404).json({ 
                success: false,
                message: 'Produk tidak ditemukan' 
            });
        }

        // Jika request berhasil
        res.status(200).json({ 
            success: true, 
            data: rows[0] 
        });
    });
});

//Memapilkan berdasarkan id kategori
app.get('/category/:idCategory', (req, res) => {
    // buat query sql
    const querySql = `SELECT namaProduk, harga, gambar FROM product WHERE idCategory = ${req.params.idCategory}`;
    console.log(`Request id = ${req.params.idCategory}` );

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});

//Search Produk
app.get('/search', (req, res) => {
    const namaProduk = req.query.namaProduk; // Ambil query parameter namaProduk
    let querySql = 'SELECT namaProduk AS Produk, harga AS Harga, gambar AS Gambar FROM product';
    let params = [];

    // Jika ada parameter pencarian, tambahkan filter
    if (namaProduk) {
        querySql += ' WHERE namaProduk LIKE ?';
        params.push(`%${namaProduk}%`);
    }

    console.log('SQL Query:', querySql);
    console.log('Parameter:', params);

    // Jalankan query SQL
    koneksi.query(querySql, params, (err, rows) => {
        if (err) {
            console.error('Error Query:', err);
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // Kirim hasil query
        res.status(200).json({ success: true, data: rows });
    });
});

//Search Produk 2
//app.get('/error/search', (req, res) => {
   // const searchQuery = req.query.namaProduk;  // Ambil kata kunci dari query parameter
    //const query = `SELECT namaProduk, harga, gambar FROM product WHERE namaProduk LIKE ?`;

  //  db.query(query, [`%${searchQuery}%`], (err, results) => {
       // if (err) {
      //      console.error(err);
      //      return res.status(500).send('Terjadi kesalahan pada server');
       // }
      //  res.json(results);  // Kembalikan hasil pencarian
   // });
//});

  


//Menampilkan category
app.get('/api/category', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM category';
    console.log('Ini GET' );

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});

app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
