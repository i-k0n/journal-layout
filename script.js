function calculateSpread() {
    clearCanvas();
    // subtract 1 from dots for column count
    const numColumns = parseInt(document.getElementById('num-columns').value - 1);
    // subtract 1 from dots for row count
    const numRows = parseInt(document.getElementById('num-rows').value - 1);
    const reservedRows = parseInt(document.getElementById('reserved-rows').value) || 0;
    const haveRowGap = document.getElementById('row-gap').checked;
    const haveColGap = document.getElementById('col-gap').checked;
    const fillPage = document.getElementById('fill-page').checked;
    const sections = parseInt(document.getElementById('sections').value) || 1;
    const columns = parseInt(document.getElementById('columns').value) || 1;

    // Calculate available rows:
    //   - subtract number of reserved rows from row count, add 1 to sum for gap between title and content
    //   - if adding gaps between rows:
    //       - subtract 1 from vertical sections needed for gap count, 
    //       - then subtract that amount from the row count
    const rowsAvailable = numRows - (reservedRows + 1) - (haveRowGap ? (sections - 1) : 0);

    // get modulus of vertical sections to use for calculating different row heights for filling the page
    const rowRemainder = rowsAvailable % sections;
    
    // store number for number of sections with unaltered heights (without remainder)
    // then use rowRemainder for the number of sections with altered heights
    const normSections = sections - rowRemainder;

    // store calculation for row height
    const normHeight = Math.floor(rowsAvailable / sections);

    // create variable to call for results string
    let sectionSize;

    // do math
    if (!fillPage || rowRemainder === 0) {
        // if not filling page:
        //   - use sections count for number of sections and normHeight for height of sections
        //   - if there is a remainder:
        //       - list remaining rows leftover
        sectionSize = `You should make ${sections} sections, each with a height of ${normHeight} rows ${rowRemainder === 0 ? "." : ", and you should have " + rowRemainder + " rows leftover"}`
    } else {
        // if filling page, use modulus to calculate uneven section sizes
        // calculate uneven sections
        // if modulus is one shy, short one row instead of lengthening the others
        // if (normSections > 1) {
        if (normSections > 1) {
            // add to bottom rows
            sectionSize = `You should make ${normSections} sections each with a height of ${normHeight} rows, and ${rowRemainder} ${rowRemainder > 1 ? "sections" : "section"} each with a height of ${normHeight + 1} rows.`
        } else {
            // short last row
            sectionSize = `You should make ${rowRemainder} sections each with a height of ${normHeight + 1} rows, and ${normSections} section with a height of ${normHeight} rows.`
        }
    }

    const result = document.getElementById('result');
    result.innerHTML = `
        <p><em>${sectionSize}</em></p>
    `;

    console.log(`
    Number of columns: ${numColumns}
    Number of rows:    ${rowsAvailable}
    Row gap?           ${haveRowGap}
    Column gap?        ${haveColGap}
    Fill page?         ${fillPage}
    Row remainder      ${rowRemainder}
    Sections:          ${sections}
    Gaps:              ${haveRowGap ? sections - 1 : 0}
    `);


    drawCanvas(numColumns, rowsAvailable, sections, columns, reservedRows, normHeight, haveRowGap, haveColGap, fillPage, normSections, rowRemainder);

}
const c = document.getElementById("canvas");
const ctx = c.getContext("2d");

function clearCanvas() {
    // ctx.clearRect(0, 0, c.width, c.height);
    c.width = c.width; // dangerous in some cases; clears canvas state such as transformations, lineWidth and strokeStyle
}

function drawCanvas(columns, rows, sectionsReq, columnsReq, titleRows, rowHeight, addRowGap, addColGap, fillPage, normSections, rowRemainder) {

    // canvas tips:
    // center stroke, so add 1 to each starting point.
    // ctx.rect((width/2)+1, 1, width/2, 24*rowHeight);  // two boxes half width
    // ctx.rect(columns/3*oneColumn*i+1, 24*rowHeight+1, columns/3*oneColumn, 24*rowHeight); // for even (3) columns ignoring column widths on dots
    // ctx.rect(Math.floor(columns/3)*oneColumn*i+1+(oneColumn*i), 24*rowHeight+1, Math.floor(columns/3)*oneColumn, 24*rowHeight); // even 3 columns with one column gap, on dots

    const width = c.width-2;
    const height = c.height-2;
    const oneColumn = 24;
    const columnWidth = columns/columnsReq*oneColumn;

    console.log("Drawing canvas...");
    console.log("normal sections", normSections);
    
    // ctx.lineWidth = 2;
    // ctx.beginPath();
    let Xpos = 1;
    let Ypos = 1;
    let boxWidth;
    let boxHeight;

    // draw title area
    ctx.rect(1, Ypos, width, oneColumn*titleRows);

    // update Y-position after drawing title
    Ypos += oneColumn+oneColumn*titleRows-1
    
    // ctx.rect((width/2)+1, 1, width/2, 24*rowHeight);
    // ctx.rect(1, 24*rowHeight+1, Math.floor(columns/3)*oneColumn, 24*rowHeight);


    for (let i = 0; i < sectionsReq; i++) {
        for (let j = 0; j < columnsReq; j++) {
            
            // Get X-position: 
            //   - number of total columns divided by number of columns needed, rounded down
            //   - multiply the above by the width of a column (24px) by the stage in the loop (0 to one minus the number of columns requested)
            //   - then add one to account for the center stroke so the box is placed correctly
            Xpos = Math.floor(columns/columnsReq)*oneColumn*j+1+(oneColumn*j);
            
            // Get Box Width:
            //   - number of total columns divided by number of columns needed, rounded down
            //   - multiply the above by the width of a column (24px)
            boxWidth = Math.floor(columns/columnsReq)*oneColumn;

            // Get Box Height:
            //   - multiply the width of a column (24px) by the calculated row height
            //   TODO: update value mid-loop for fillPage calculation or run a second loop
            if (fillPage && rowRemainder) {
                if (i < rowRemainder) {
                    console.log("fp1", i, rowRemainder, rowHeight+1);
                    boxHeight = oneColumn*(rowHeight+1);
                } else {
                    console.log("fp2", i, rowRemainder, rowHeight);
                    boxHeight = oneColumn*rowHeight;
                }
            } else {
                boxHeight = oneColumn*rowHeight;
            }
            
            if (addColGap) {
                // Draw rectangle
                // console.log(`Draw1 - Xpos: ${Xpos}, Ypos: ${Ypos+1}`);
                ctx.rect(Xpos, Ypos+1, boxWidth, boxHeight);        
            } else {
                // console.log(`Draw2: Xpos: ${columnWidth*j+1}, Ypos: ${Ypos+1}`);
                ctx.rect(columnWidth*j+1, Ypos+1, columnWidth, boxHeight);
            }
        }
        
        // Update Y-position after each row is drawn
        addRowGap ? Ypos += boxHeight + oneColumn : Ypos += boxHeight;
        
        
    }

    ctx.strokeStyle = "#999"
    ctx.stroke();       

}