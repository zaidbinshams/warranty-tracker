function App() {
  return (
    <div>
      <header>
        <h1>Warranty Tracker</h1>
        <p>Your products, warranties, and documents in one place.</p>
      </header>

      <main>
        <section>
          <h2>Overview</h2>

          <div>
            <p>Products</p>
            <strong>0</strong>
          </div>

          <div>
            <p>Active Warranties</p>
            <strong>0</strong>
          </div>

          <div>
            <p>Expiring Soon</p>
            <strong>0</strong>
          </div>

          <div>
            <p>Expired</p>
            <strong>0</strong>
          </div>
        </section>

        <section>
          <h2>Products</h2>
          <p>You haven't added any products yet.</p>

          <button>Add Product</button>
        </section>
      </main>
    </div>
  );
}

export default App;