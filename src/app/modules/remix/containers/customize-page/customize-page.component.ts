import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as i from '../../+state/remix.interfaces';
import * as ia from '../../../../state/app.interfaces';
import { Store, select } from '@ngrx/store';
import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NextRunningNo } from '../../+state/remix.actions';
import { AddToCoffeeList, AddToCart } from '../../../../state/app.actions';

@Component({
  selector: 'app-customize-page',
  templateUrl: './customize-page.component.html',
  styleUrls: ['./customize-page.component.css']
})
export class CustomizePageComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();

  ingredients = [
    'chocolate syrup',
    'espresso',
    'milk foam',
    'steamed milk',
    'whipped cream',
    'water'
  ];

  coffee: ia.Coffee;

  constructor(private route: ActivatedRoute, private router: Router, private store: Store<i.RemixState>) { }

  ngOnInit() {
    const { template = '' } = this.route.snapshot.queryParams;

    this.store
      .pipe(
        select(x => ({
          template: x.app.coffeeList.find(c => c.name === template),
          runningNo: x.remix.runningNo
        })),
        takeUntil(this.destroy$)
      ).subscribe(x => {
        // get template recipe if any
        const templateRecipe = x.template ? x.template.recipe : [];

        // merge template recipe with default recipe
        const recipe = this.ingredients.map(ing => {
          const item = templateRecipe.find(r => r.name === ing) || { name: ing, quantity: 0 };
          return { ...item };
        });

        this.coffee = {
          name: 'Special Cafe ' + x.runningNo.toString().padStart(2, '0'),
          price: 20,
          recipe
        };
      });
  }

  addToCart(coffee: any) {
    // actions
    this.store.dispatch(new AddToCoffeeList([coffee]));
    this.store.dispatch(new AddToCart(coffee.name));
    this.store.dispatch(new NextRunningNo());
    // route
    this.router.navigateByUrl('/cart');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
