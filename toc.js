// The table of content (toc) is made of nested lists of links mirroring the
// hierarchy of headings in the document. A toc link represents not just its
// corresponding heading, but the entire section of the page between that
// heading and the following one. Example:
//
//     TOC              Content
//   link A ---------> <h1>A</h1>
//                 |   Lorem
//                 |   ipsum
//                 +-- dolor
//     Link B -------> <h2>B</h2>
//       Link C -----> <h3>C</h3>
//                 |   sit
//                 |   amet,
//                 |   consectetur
//                 |   adipiscing
//                 +-- elit,
//   link D ---------> <h1>D</h1>
//                 |   sed
//                 +-- do

"use strict";

let main;
let tocId;
let headings;

// Return the heading level of the given 'heading' DOM element,
// e.g. 3 for an H3 element.
function heading_level(heading) {
    return parseInt(heading.tagName.slice(-1));
}

// Return the list element (at the proper nesting level) to which the
// given 'heading' element belongs.
function list_from_heading(heading, prev_heading, current_list) {
    let list = current_list;  // return value
    if (prev_heading) {
        const nesting_level = heading_level(heading);
        const prev_nesting_level = heading_level(prev_heading);
        if (nesting_level > prev_nesting_level) {
            // Add a nested list
            const sublist = document.createElement("ul");
            list.appendChild(sublist);
            list = sublist;
        } else if (prev_nesting_level > nesting_level) {
            // Climb up the DOM tree to find the appropriate list element
            const nesting_delta = prev_nesting_level - nesting_level;
            for (let i = 0; i < nesting_delta; i++) {
                list = list.parentElement;
            }
        }
    }
    return list;
}

function set_heading_id(element, appendedId) {
    if (!element.id) {  // !!!!!!!!       !!!!!!!!!!        !!!!!!!!!!!        !!!!!!!!!!!!!!      !!!!!!!!!!!!    can we use some other attribute, not id? E.g. toc_id
        element.id = `${element.innerHTML
            .replace(/[^a-zA-Z ]/g, "")
            .trim()
            .toLowerCase()
            .split(" ")
            .join("-")}-${appendedId}`;
    }
}

function add_toc_link_for_heading(heading, list) {
    const anchor = document.createElement("a");
    anchor.innerHTML = heading.innerHTML;
    anchor.id = `${heading.id}-link`;
    anchor.href = `#${heading.id}`;
    const list_item = document.createElement("li");
    list_item.appendChild(anchor);
    list.appendChild(list_item);
}

function build_toc() {
    // Add the top-level nested list
    const toc_element = document.querySelector(`#${tocId}`);
    const top_level_list = document.createElement("ul");
    toc_element.appendChild(top_level_list);

    // Add a toc link (at the proper nesting level) for each heading
    headings = main.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let prev_heading;
    let current_list = top_level_list;
    headings.forEach((heading, index) => {
        set_heading_id(heading, index);  // !!!!!!!!       !!!!!!!!!!        !!!!!!!!!!!  why isn't index enough for uniqueness?  e.g. 'toc-<index>'  But it's nice for the link to encode the heading, it makes it more visible
        current_list = list_from_heading(heading, prev_heading, current_list);
        add_toc_link_for_heading(heading, current_list);
        prev_heading = heading;
    });
}

let active_link;  // !!!!!!!!!!       !!!!!!!!!!!!!!        !!!!!!!!!!!!!!!!  if we wrap the entire thing with a class and use an instance of it, then we can convert all the global variables into instance variables

function find_active_heading() {
    const viewport_height = window.innerHeight;

    // Loop over the headings to find the best one to highlight in the toc.
    // The heading links in the toc represent not just the actual headings
    // in the content of the page, but the entire content from this heading
    // until the next heading. Thus while the best heading highlight in the
    // toc is the first which intersects the viewport, there's some logic
    // which tries to fine tune the decision in corner cases.
    let active_heading;  // return value
    let last_heading_above_viewport;
    for (let heading of headings) {
        const heading_top = heading.getBoundingClientRect().top;
        const heading_bottom = heading.getBoundingClientRect().bottom;

        if (heading_bottom <= 10) {
            // 'heading' is (almost) entirely above the viewport, so the
            // document section it represents may be in the viewport.
            last_heading_above_viewport = heading;
            continue;
        }

        // If we reach here then 'heading' is either in or below the viewport.

        if (last_heading_above_viewport && heading_top > viewport_height * 9 / 10) {
            active_heading = last_heading_above_viewport;
        } else if (heading_top < viewport_height - 10) {
            active_heading = heading;
        } else {
            // This heading is (almost entirely) below the viewport. Any subsequent
            // headings must fall into the same category, so there's no point to
            // continue looping.
        }
        break;
    }

    return active_heading;
}

function highlight() {
    const heading = find_active_heading();
    if (active_link) {
        active_link.classList.remove("active");
        active_link = null;
    }

    if (heading) {
        // Set the toc link corresponding to 'heading' as the new
        // active link.
        const id = heading.id;
        //console.log("ID found: " + id);
        const link = document.querySelector("#" + id + "-link");
        //console.log("Link: " + link);
        link.classList.add("active");
        active_link = link;
    }
}

export default function add_toc(main_tag = "main", nav_id = "toc") {
    tocId = nav_id;
    window.addEventListener("load", (event) => {
        main = document.querySelector(main_tag);
        if (!main) {
            throw Error("A `main` tag section is required to query headings from.");
        }
        build_toc();
        highlight();
        main.addEventListener('scroll', highlight);
    });
}
