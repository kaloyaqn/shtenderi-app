  export async function downloadSalePdf(revision, adminName, method = "a4") {
    const res = await fetch(`/api/prints/sale?method=${method}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ revision, adminName: "Bashta mi" })
    });

    if (!res.ok) {
      alert("Грешка при генериране на PDF");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `stock-${revision.number}.pdf`;
    link.click();

    URL.revokeObjectURL(url);
  }
